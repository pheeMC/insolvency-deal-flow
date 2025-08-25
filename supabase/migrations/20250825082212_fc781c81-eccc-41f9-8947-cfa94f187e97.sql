-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'insolvency-admin', 'ma-advisor', 'deal-admin', 'bidder-lead', 'bidder-member', 'clean-team', 'viewer')),
    organization TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    access_level TEXT[] DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
    file_path TEXT,
    size TEXT,
    access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'restricted', 'clean-team')),
    watermark BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    uploaded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Q&A threads table
CREATE TABLE public.qa_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in-review', 'answered', 'published')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    visibility TEXT DEFAULT 'all-bidders' CHECK (visibility IN ('all-bidders', 'specific-bidder', 'internal')),
    asked_by TEXT NOT NULL,
    answered_by TEXT,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bidder_name TEXT NOT NULL,
    bidder_type TEXT CHECK (bidder_type IN ('strategic', 'financial')),
    amount DECIMAL(15,2),
    currency TEXT DEFAULT 'EUR',
    phase TEXT DEFAULT 'IOI' CHECK (phase IN ('IOI', 'NBO', 'Final')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'shortlisted', 'rejected')),
    submitted_by TEXT,
    conditions TEXT[],
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timeline events table
CREATE TABLE public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    type TEXT DEFAULT 'milestone' CHECK (type IN ('milestone', 'document', 'qa', 'bid', 'meeting')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('completed', 'ongoing', 'upcoming')),
    participants TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal settings table
CREATE TABLE public.deal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_name TEXT NOT NULL,
    deal_type TEXT,
    phase TEXT,
    nbo_deadline DATE,
    final_bid_deadline DATE,
    closing_expected DATE,
    watermark_enabled BOOLEAN DEFAULT true,
    download_restrictions BOOLEAN DEFAULT true,
    audit_logging BOOLEAN DEFAULT true,
    email_alerts BOOLEAN DEFAULT true,
    qa_notifications BOOLEAN DEFAULT true,
    bid_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_settings ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for documents (all authenticated users can access)
CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update documents" ON public.documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete documents" ON public.documents FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for other tables (all authenticated users)
CREATE POLICY "Authenticated users can access qa_threads" ON public.qa_threads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access bids" ON public.bids FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access timeline_events" ON public.timeline_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access deal_settings" ON public.deal_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policies
CREATE POLICY "Authenticated users can view documents" ON storage.objects 
    FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents" ON storage.objects 
    FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qa_threads_updated_at BEFORE UPDATE ON public.qa_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON public.timeline_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deal_settings_updated_at BEFORE UPDATE ON public.deal_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();