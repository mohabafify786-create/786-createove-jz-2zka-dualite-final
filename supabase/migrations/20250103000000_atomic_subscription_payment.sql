/*
  # Atomic Subscription Payment Processing Function
  
  Provides an ACID-compliant, concurrency-safe database function to process
  PayPal PAYMENT.SALE.COMPLETED events.
  
  Guarantees:
  1. Strict Idempotency: Uses double-checked row locking (FOR UPDATE) and unique constraint.
  2. Race-Condition Immunity: Two concurrent webhook deliveries for the same sale ID cannot extend end_date twice.
  3. All-or-Nothing Atomicity: Ledger insertion and entitlement extension commit together or roll back completely.
  4. Unexpired Time Preservation: Extends from existing end_date if unexpired.
*/

CREATE OR REPLACE FUNCTION public.process_subscription_sale(
  p_sale_id TEXT,
  p_subscription_id TEXT,
  p_amount DECIMAL,
  p_currency TEXT,
  p_duration_days INT,
  p_event_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  already_processed BOOLEAN,
  user_subscription_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_sub RECORD;
  v_base_time TIMESTAMPTZ;
  v_new_end_date TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Fast-path check: has this sale already been processed?
  IF EXISTS (SELECT 1 FROM subscription_payments WHERE paypal_sale_id = p_sale_id) THEN
    SELECT us.id, us.start_date, us.end_date INTO v_sub
    FROM user_subscriptions us
    WHERE us.paypal_subscription_id = p_subscription_id;

    RETURN QUERY SELECT TRUE, TRUE, v_sub.id, v_sub.start_date, v_sub.end_date, NULL::TEXT;
    RETURN;
  END IF;

  -- 2. Concurrency control: Lock the target subscription row FOR UPDATE
  SELECT * INTO v_sub
  FROM user_subscriptions
  WHERE paypal_subscription_id = p_subscription_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 'Subscription not found for ID: ' || p_subscription_id;
    RETURN;
  END IF;

  -- 3. Double-check pattern: re-verify if sale was recorded while waiting on the lock
  IF EXISTS (SELECT 1 FROM subscription_payments WHERE paypal_sale_id = p_sale_id) THEN
    RETURN QUERY SELECT TRUE, TRUE, v_sub.id, v_sub.start_date, v_sub.end_date, NULL::TEXT;
    RETURN;
  END IF;

  -- 4. Calculate new end_date
  -- If currently active and end_date is in future, preserve unexpired time by adding to end_date
  IF v_sub.status = 'active' AND v_sub.end_date IS NOT NULL AND v_sub.end_date > v_now THEN
    v_base_time := v_sub.end_date;
  ELSE
    v_base_time := v_now;
  END IF;

  v_new_end_date := v_base_time + (p_duration_days || ' days')::INTERVAL;

  -- 5. Insert ledger entry into subscription_payments FIRST
  INSERT INTO subscription_payments (
    paypal_subscription_id,
    paypal_sale_id,
    event_id,
    amount,
    currency,
    status,
    created_at
  ) VALUES (
    p_subscription_id,
    p_sale_id,
    p_event_id,
    COALESCE(p_amount, v_sub.amount),
    COALESCE(p_currency, v_sub.currency, 'USD'),
    'completed',
    v_now
  );

  -- 6. Atomically update user_subscriptions
  UPDATE user_subscriptions
  SET status = 'active',
      payment_status = 'completed',
      start_date = COALESCE(v_sub.start_date, v_now),
      end_date = v_new_end_date,
      amount = COALESCE(p_amount, v_sub.amount),
      currency = COALESCE(p_currency, v_sub.currency, 'USD'),
      updated_at = v_now
  WHERE id = v_sub.id;

  RETURN QUERY SELECT TRUE, FALSE, v_sub.id, COALESCE(v_sub.start_date, v_now), v_new_end_date, NULL::TEXT;
  RETURN;

EXCEPTION
  WHEN unique_violation THEN
    -- Handled race condition: another concurrent worker committed the same sale_id
    SELECT us.id, us.start_date, us.end_date INTO v_sub
    FROM user_subscriptions us
    WHERE us.paypal_subscription_id = p_subscription_id;

    RETURN QUERY SELECT TRUE, TRUE, v_sub.id, v_sub.start_date, v_sub.end_date, NULL::TEXT;
    RETURN;
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, FALSE, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, SQLERRM;
    RETURN;
END;
$$;
