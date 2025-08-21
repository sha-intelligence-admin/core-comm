-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create company table
CREATE TABLE IF NOT EXISTS public.company (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company_size TEXT CHECK (company_size IN ('small', 'medium', 'large')) NOT NULL,
  member_key text NOT NULL,
  industry TEXT NOT NULL,
  phone_numbers TEXT[],
  business_hours JSONB,
  timezone TEXT NOT NULL,
  primary_goals TEXT[],
  expected_volume INT,
  success_metrics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  logo_url TEXT,
  description TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_id UUID REFERENCES public.company(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_active BOOLEAN DEFAULT true
);

-- Create calls table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  caller_number TEXT NOT NULL,
  recipient_number TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  transcript TEXT,
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'escalated', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id UUID REFERENCES public.company(id) ON DELETE CASCADE,
  call_type TEXT DEFAULT 'inbound' CHECK (call_type IN ('inbound', 'outbound')),
  summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mcp', 'webhook', 'api', 'crm', 'helpdesk')),
  endpoint_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id UUID REFERENCES public.company(id) ON DELETE CASCADE,
  description TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_company_id ON public.calls(company_id);
CREATE INDEX IF NOT EXISTS idx_calls_resolution_status ON public.calls(resolution_status);
CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON public.integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON public.integrations(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_updated_at BEFORE UPDATE ON public.company
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;


-- RLS Policies for company
CREATE POLICY "Only admins can update company"
ON public.company
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.company_id = company.id
      AND u.role = 'admin'
  )
);

CREATE POLICY "Users can view their own company"
ON public.company
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid()
    AND users.company_id = company.id
  )
);

CREATE POLICY "Authenticated users can create a company" ON public.company
  FOR INSERT WITH CHECK (true);

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for calls
-- A user can only see calls from their company.
CREATE POLICY "Users can view their company's calls" ON public.calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.calls.company_id
    )
  );

-- Users can insert a call for their company.
CREATE POLICY "Users can insert calls for their company" ON public.calls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.calls.company_id
    )
  );

-- Users can update a call for their company.
CREATE POLICY "Users can update their company's calls" ON public.calls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.calls.company_id
    )
  );

-- RLS Policies for integrations
-- Users can view integrations for their company.
CREATE POLICY "Users can view their company's integrations" ON public.integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.integrations.company_id
    )
  );

-- Users can insert integrations for their company.
CREATE POLICY "Users can insert integrations for their company" ON public.integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.integrations.company_id
    )
  );

-- Users can update integrations for their company.
CREATE POLICY "Users can update their company's integrations" ON public.integrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.integrations.company_id
    )
  );

-- Users can delete integrations for their company.
CREATE POLICY "Users can delete their company's integrations" ON public.integrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.company_id = public.integrations.company_id
    )
  );