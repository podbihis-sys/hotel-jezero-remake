-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  contact TEXT,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read events
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (true);
-- Only service role can modify events (through API routes)
CREATE POLICY "Events modifiable by service role" ON events FOR ALL USING (auth.role() = 'service_role');

-- Public can read settings
CREATE POLICY "Settings are publicly readable" ON site_settings FOR SELECT USING (true);
-- Only service role can modify settings
CREATE POLICY "Settings modifiable by service role" ON site_settings FOR ALL USING (auth.role() = 'service_role');

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('piste_status', '{"open": false}'::jsonb),
  ('cameras', '{"adriaski": false, "sidrokamera": false, "tikvice": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
