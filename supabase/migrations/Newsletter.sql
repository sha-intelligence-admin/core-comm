CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_newsletters_email ON newsletters(email);

-- Create index for active subscriptions
CREATE INDEX idx_newsletters_active ON newsletters(is_active);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts (for new subscriptions)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletters FOR INSERT 
WITH CHECK (true);

-- Policy to allow updates (for unsubscribing)
CREATE POLICY "Anyone can update their subscription" 
ON newsletters FOR UPDATE 
USING (true);

-- Policy to allow reads (for checking existing subscriptions)
CREATE POLICY "Anyone can check subscription status" 
ON newsletters FOR SELECT 
USING (true);

-- Optional: Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE
ON newsletters FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();