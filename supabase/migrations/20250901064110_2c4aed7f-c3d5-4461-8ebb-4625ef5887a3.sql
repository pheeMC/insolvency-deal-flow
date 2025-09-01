-- Fix activity logs RLS policies to work correctly with the foreign key structure
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs" ON activity_logs;

-- Create a simpler, working RLS policy for activity logs
-- Allow users to see logs where the linked profile's user_id matches their auth.uid()
CREATE POLICY "Users can view their own activity logs" ON activity_logs
FOR SELECT USING (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to insert activity logs with proper user_id
CREATE POLICY "Users can insert activity logs" ON activity_logs
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);