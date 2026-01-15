-- Create agent_instances table
CREATE TABLE IF NOT EXISTS agent_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  instance_url TEXT NOT NULL,
  project_id TEXT NOT NULL,
  region TEXT NOT NULL,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT agent_instances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_instances_user_id ON agent_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_status ON agent_instances(status);
CREATE INDEX IF NOT EXISTS idx_agent_instances_expires_at ON agent_instances(expires_at);

-- Create RLS policies
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;

-- Users can only see their own instances
CREATE POLICY "Users can view their own instances" ON agent_instances
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only insert their own instances
CREATE POLICY "Users can insert their own instances" ON agent_instances
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can only update their own instances
CREATE POLICY "Users can update their own instances" ON agent_instances
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can only delete their own instances
CREATE POLICY "Users can delete their own instances" ON agent_instances
  FOR DELETE USING (auth.uid()::text = user_id);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access" ON agent_instances
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to clean up expired instances
CREATE OR REPLACE FUNCTION cleanup_expired_instances()
RETURNS void AS $$
BEGIN
  UPDATE agent_instances 
  SET status = 'inactive', deleted_at = NOW()
  WHERE status = 'active' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup function to run periodically (optional)
-- This would require pg_cron extension
-- SELECT cron.schedule('cleanup-expired-instances', '0 * * * *', 'SELECT cleanup_expired_instances();');
