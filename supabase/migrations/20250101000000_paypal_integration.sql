/*
  # PayPal Integration Migration
  
  Creates database tables for PayPal subscription management.
  
  ## Tables Created:
  - paypal_config: Stores PayPal API credentials (server-side only)
  - user_subscriptions: Tracks user subscription status
  - webhook_events: Prevents duplicate webhook processing
  - paypal_plans: Maps website plans to PayPal Plan IDs
  
  ## Security:
  - Client Secret is stored in paypal_config (never exposed to frontend)
  - RLS policies protect user data
  - Webhook events prevent duplicate processing
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PayPal Configuration Table
-- Stores PayPal API credentials securely (server-side only)
CREATE TABLE IF NOT EXISTS paypal_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'live')),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  webhook_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique partial index for active config
CREATE UNIQUE INDEX IF NOT EXISTS single_active_config_idx 
  ON paypal_config (is_active) 
  WHERE (is_active = true);

-- User Subscriptions Table
-- Tracks user subscription status and PayPal subscription IDs
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  paypal_subscription_id TEXT UNIQUE,
  paypal_plan_id TEXT,
  website_plan_id TEXT NOT NULL CHECK (website_plan_id IN ('weekly', 'monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'suspended', 'expired')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'reversed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_paypal_id ON user_subscriptions (paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions (status);

-- Webhook Events Table
-- Prevents duplicate webhook processing (idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  resource_id TEXT,
  resource_type TEXT,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events (event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events (processed);

-- PayPal Plans Table
-- Maps website plans to PayPal Plan IDs
CREATE TABLE IF NOT EXISTS paypal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_plan_id TEXT UNIQUE NOT NULL CHECK (website_plan_id IN ('weekly', 'monthly', 'yearly')),
  paypal_plan_id TEXT,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans (PayPal Plan IDs need to be configured manually)
INSERT INTO paypal_plans (website_plan_id, name, price, duration_days) VALUES
  ('weekly', 'Weekly', 4.99, 7),
  ('monthly', 'Monthly', 14.99, 30),
  ('yearly', 'Yearly', 59.99, 365)
ON CONFLICT (website_plan_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE paypal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paypal_config
-- Only service role can access (for Edge Functions)
CREATE POLICY "Service role can manage paypal_config" ON paypal_config
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_subscriptions
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text OR user_id = (auth.jwt() ->> 'sub'));

-- Service role can manage all subscriptions
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for webhook_events
-- Only service role can access
CREATE POLICY "Service role can manage webhook_events" ON webhook_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for paypal_plans
-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" ON paypal_plans
  FOR SELECT
  USING (is_active = true);

-- Service role can manage plans
CREATE POLICY "Service role can manage plans" ON paypal_plans
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_paypal_config_updated_at
  BEFORE UPDATE ON paypal_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paypal_plans_updated_at
  BEFORE UPDATE ON paypal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
