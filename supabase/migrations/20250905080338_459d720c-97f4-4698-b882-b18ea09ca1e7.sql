-- Create initial deal settings
INSERT INTO public.deal_settings (deal_name, deal_type, phase, timeline, nbo_deadline, final_bid_deadline, closing_expected, watermark_enabled, download_restrictions, audit_logging, email_alerts, qa_notifications, bid_notifications)
VALUES ('Test GmbH - Asset Deal', 'Asset Deal', 'NBO Phase', '8 weeks', '2024-03-15', '2024-04-15', '2024-05-15', true, true, true, true, true, true)
ON CONFLICT (deal_name) DO UPDATE SET
  deal_type = EXCLUDED.deal_type,
  phase = EXCLUDED.phase,
  timeline = EXCLUDED.timeline;

-- Create sample documents
INSERT INTO public.documents (name, type, parent_id, size, uploaded_by, access_level, watermark)
VALUES 
  ('Financial Statements', 'folder', null, null, 'System', 'full', false),
  ('Legal Documents', 'folder', null, null, 'System', 'full', false),
  ('Due Diligence', 'folder', null, null, 'System', 'full', false),
  ('Balance Sheet 2023.pdf', 'file', '1', '2.4 MB', 'Finance Team', 'full', true),
  ('P&L Statement 2023.pdf', 'file', '1', '1.8 MB', 'Finance Team', 'full', true),
  ('Articles of Association.pdf', 'file', '2', '3.2 MB', 'Legal Team', 'restricted', true),
  ('Share Purchase Agreement.pdf', 'file', '2', '4.1 MB', 'Legal Team', 'restricted', true),
  ('DD Report Summary.pdf', 'file', '3', '5.8 MB', 'Advisory Team', 'full', true);

-- Create sample Q&A threads
INSERT INTO public.qa_threads (title, question, category, priority, asked_by, status, visibility)
VALUES 
  ('Financial Performance Q3', 'Can you provide details on the Q3 financial performance compared to budget?', 'Financial', 'high', 'Strategic Buyer A', 'new', 'all-bidders'),
  ('Employee Count and Structure', 'What is the current employee headcount and organizational structure?', 'HR', 'medium', 'Financial Buyer B', 'answered', 'all-bidders'),
  ('Regulatory Compliance', 'Are there any pending regulatory issues or compliance matters?', 'Legal', 'high', 'Strategic Buyer C', 'new', 'all-bidders'),
  ('IT Infrastructure', 'Can you detail the current IT infrastructure and any planned upgrades?', 'Technical', 'medium', 'Strategic Buyer A', 'new', 'all-bidders');

-- Update one Q&A with an answer
UPDATE public.qa_threads 
SET answer = 'The current employee headcount is 250 FTE across 3 main divisions: Operations (180), Sales & Marketing (45), and Administration (25). The organizational structure includes a management board of 5 executives reporting to the CEO.',
    answered_by = 'HR Director',
    status = 'answered'
WHERE title = 'Employee Count and Structure';

-- Create sample bids
INSERT INTO public.bids (bidder_name, bidder_type, amount, currency, phase, status, submitted_by, conditions)
VALUES 
  ('Strategic Buyer Alpha', 'Strategic', 45000000, 'EUR', 'IOI', 'submitted', 'Alpha Corp M&A Team', ARRAY['Due diligence completion', 'Regulatory approval']),
  ('Private Equity Beta', 'Financial', 42500000, 'EUR', 'IOI', 'submitted', 'Beta Partners', ARRAY['Management retention', 'Financing confirmation']),
  ('Industry Player Gamma', 'Strategic', 48000000, 'EUR', 'NBO', 'draft', 'Gamma Industries', ARRAY['Synergy realization', 'Integration planning']),
  ('Investment Fund Delta', 'Financial', 40000000, 'EUR', 'IOI', 'submitted', 'Delta Capital', ARRAY['Management participation', 'Debt financing']);

-- Create sample timeline events
INSERT INTO public.timeline_events (title, description, event_date, event_time, type, status, participants)
VALUES 
  ('Phase 1: NDA & Initial Access', 'Execute NDAs with potential bidders and provide initial access to teaser materials', '2024-01-15', '09:00', 'milestone', 'completed', ARRAY['M&A Team', 'Legal Team']),
  ('Phase 2: Initial Offers (IOI)', 'Collect and evaluate initial indications of interest from qualified bidders', '2024-02-01', '17:00', 'milestone', 'completed', ARRAY['Deal Team', 'Advisory Team']),
  ('Phase 3: Non-Binding Offers (NBO)', 'Enhanced due diligence and non-binding offer submission', '2024-02-28', '17:00', 'milestone', 'upcoming', ARRAY['Legal Team', 'Financial Team']),
  ('Management Presentations', 'Presentations to shortlisted bidders', '2024-02-15', '14:00', 'meeting', 'upcoming', ARRAY['Management Board', 'Advisory Team']),
  ('Phase 4: Final Bids & Selection', 'Binding offers, final negotiations, and preferred bidder selection', '2024-03-15', '17:00', 'milestone', 'upcoming', ARRAY['Executive Team', 'Board']);

-- Create sample user profiles
INSERT INTO public.profiles (user_id, full_name, email, role, organization, status, access_level)
VALUES 
  ('user1', 'John Administrator', 'admin@test-company.de', 'deal-admin', 'Test GmbH', 'active', ARRAY['documents', 'qa', 'bids', 'users', 'timeline', 'settings']),
  ('user2', 'Sarah Financial', 'sarah.finance@advisor.com', 'ma-advisor', 'M&A Advisory Firm', 'active', ARRAY['documents', 'qa', 'bids', 'timeline']),
  ('user3', 'Michael Strategic', 'michael@strategicbuyer.com', 'bidder-lead', 'Strategic Buyer Alpha', 'active', ARRAY['documents', 'qa', 'bids']),
  ('user4', 'Lisa Private', 'lisa@privateequity.com', 'bidder-lead', 'Private Equity Beta', 'active', ARRAY['documents', 'qa', 'bids']),
  ('user5', 'Thomas Legal', 'thomas@legalfirm.com', 'clean-team', 'Legal Advisory', 'active', ARRAY['documents', 'qa']);

-- Create some activity logs
INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details)
SELECT 
  p.id,
  'Document Accessed',
  'document',
  d.id::text,
  jsonb_build_object('document_name', d.name)
FROM profiles p, documents d
WHERE p.email = 'michael@strategicbuyer.com' AND d.name = 'Balance Sheet 2023.pdf'
LIMIT 1;

INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details)
SELECT 
  p.id,
  'Q&A Thread Created',
  'qa_thread',
  q.id::text,
  jsonb_build_object('question_title', q.title)
FROM profiles p, qa_threads q
WHERE p.email = 'michael@strategicbuyer.com' AND q.title = 'Financial Performance Q3'
LIMIT 1;