-- Fix document parent_id to allow both UUID and string values
-- First, let's change parent_id to TEXT to handle folder names
ALTER TABLE documents ALTER COLUMN parent_id TYPE TEXT;

-- Add missing timeline column to deal_settings
ALTER TABLE deal_settings ADD COLUMN IF NOT EXISTS timeline TEXT;

-- Add foreign key relationship between activity_logs and profiles
-- First add the foreign key constraint
ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_logs_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update RLS policies for activity_logs to allow inserts
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;

CREATE POLICY "Users can view their own activity logs" ON activity_logs
FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid() IN (
  SELECT user_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert activity logs" ON activity_logs
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IN (
  SELECT user_id FROM profiles WHERE user_id = auth.uid()
));

-- Create some sample folder structure documents to match the UI expectations
INSERT INTO documents (id, name, type, parent_id, access_level, watermark, uploaded_by) VALUES 
(gen_random_uuid(), '00_Admin', 'folder', NULL, 'restricted', true, 'System'),
(gen_random_uuid(), '01_Corporate', 'folder', NULL, 'full', true, 'System'),
(gen_random_uuid(), '02_Financials', 'folder', NULL, 'full', true, 'System'),
(gen_random_uuid(), '90_InsO', 'folder', NULL, 'clean-team', true, 'System')
ON CONFLICT DO NOTHING;

-- Create sample timeline events
INSERT INTO timeline_events (title, description, event_date, event_time, type, status) VALUES
('Process Launch', 'M&A process officially launched', '2024-01-01', '09:00', 'milestone', 'completed'),
('IOI Deadline', 'Initial offers submission deadline', '2024-01-15', '17:00', 'bid', 'completed'),
('NBO Deadline', 'Non-binding offers submission deadline', '2024-02-01', '17:00', 'bid', 'upcoming'),
('Management Presentations', 'Presentations to shortlisted bidders', '2024-02-15', '14:00', 'meeting', 'upcoming')
ON CONFLICT DO NOTHING;

-- Create sample bids
INSERT INTO bids (bidder_name, bidder_type, amount, currency, phase, status, submitted_by) VALUES
('Strategic Investor Alpha', 'strategic', 12500000, 'EUR', 'NBO', 'submitted', 'Michael Chen'),
('Financial Investor Beta', 'financial', 11800000, 'EUR', 'NBO', 'submitted', 'Emma Wilson'),
('Management Buyout Team', 'financial', 9500000, 'EUR', 'NBO', 'draft', 'Management Team')
ON CONFLICT DO NOTHING;

-- Create sample Q&A threads
INSERT INTO qa_threads (category, title, question, answer, status, priority, asked_by, answered_by, visibility) VALUES
('Legal', 'Employee contract terms and conditions', 'Can you provide details about the current employee contracts, particularly regarding notice periods and severance terms?', 'All employee contracts follow standard German employment law. Notice periods range from 1-6 months depending on tenure. Severance calculations are based on 0.5 monthly salaries per year of service.', 'published', 'high', 'Strategic Investor Alpha', 'Legal Team', 'all-bidders'),
('Financial', 'Working capital requirements', 'What are the typical working capital requirements and seasonal variations?', NULL, 'in-review', 'medium', 'Financial Investor Beta', NULL, 'all-bidders'),
('Technical', 'IT infrastructure and systems', 'Please provide an overview of the current IT infrastructure, including any planned upgrades or known issues.', NULL, 'new', 'low', 'Strategic Investor Gamma', NULL, 'all-bidders')
ON CONFLICT DO NOTHING;

-- Create default deal settings
INSERT INTO deal_settings (deal_name, deal_type, phase, timeline, nbo_deadline, final_bid_deadline, closing_expected) VALUES
('Test GmbH - Asset Deal', 'Asset Deal', 'NBO', '6 weeks', '2024-02-01', '2024-03-01', '2024-04-15')
ON CONFLICT DO NOTHING;