/*
  # Subscription Payments Table Migration
  
  Creates database table for tracking individual PayPal payment transactions (Sales and Refunds)
  to ensure strict payment deduplication, prevent multiple extensions of the same billing cycle,
  and maintain an auditable payment history.
*/

CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paypal_subscription_id TEXT NOT NULL,
  paypal_sale_id TEXT UNIQUE NOT NULL,
  event_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'reversed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quick lookups and deduplication
CREATE INDEX IF NOT EXISTS idx_subscription_payments_sub_id ON subscription_payments (paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_sale_id ON subscription_payments (paypal_sale_id);

-- Enable Row Level Security
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role can manage subscription_payments" ON subscription_payments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view their own payment transactions
CREATE POLICY "Users can view own payments" ON subscription_payments
  FOR SELECT TO authenticated
  USING (
    paypal_subscription_id IN (
      SELECT paypal_subscription_id FROM user_subscriptions
      WHERE user_id = auth.uid()::text OR user_id = (auth.jwt() ->> 'sub')
    )
  );
