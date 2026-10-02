import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { SubscriptionPlan, SubscriptionState } from '../types/subscription';
import { subscriptionTiers } from '../data/subscriptionTiers';
import { supabase } from '../lib/supabase';

interface ConversationCredits {
  [conversationId: number]: number;
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  subscribe: (plan: SubscriptionPlan, paymentVerified: boolean) => boolean;
  isActive: () => boolean;
  checkSubscription: () => boolean;
  canSendMessage: (conversationId: number) => boolean;
  recordMessage: (conversationId: number) => void;
  getUserMessageCount: (conversationId: number) => number;
  decrementMessages: () => void;
  getExpiryDate: () => string | null;
  getRemainingDays: () => number;
  getRemainingMessages: () => number;
  isUserOnline: (userId: number) => boolean;
  clearSubscription: () => void;
  // Exposed for components that need to know verification is in progress
  isVerifying: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const SUB_KEY = 'heartsync_sub';
const CREDITS_KEY = 'heartsync_credits';
const GLOBAL_CREDITS_KEY = 'heartsync_global_credits';
const FREE_MESSAGES = 3;

const DEFAULT_STATE: SubscriptionState = {
  isSubscribed: false,
  plan: null,
  expiresAt: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: serverVerified is the authoritative gate for premium access.
// It can ONLY be set to true by:
//   1. A successful query to user_subscriptions (Supabase, RLS-protected, server data)
//   2. subscribe() after a PayPal payment has been verified by the Edge Function
//
// localStorage is used only as a display cache and for free-message counting.
// Manually editing localStorage cannot set serverVerified = true.
// ─────────────────────────────────────────────────────────────────────────────

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    try {
      const stored = localStorage.getItem(SUB_KEY);
      if (!stored) return DEFAULT_STATE;
      const parsed = JSON.parse(stored) as SubscriptionState;
      if (!parsed.isSubscribed || !parsed.expiresAt || !parsed.plan) {
        localStorage.removeItem(SUB_KEY);
        return DEFAULT_STATE;
      }
      const expiryDate = new Date(parsed.expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        localStorage.removeItem(SUB_KEY);
        return DEFAULT_STATE;
      }
      return parsed;
    } catch {
      localStorage.removeItem(SUB_KEY);
      return DEFAULT_STATE;
    }
  });

  // Server-verified flag — the authoritative premium access gate
  const [serverVerified, setServerVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [credits, setCredits] = useState<ConversationCredits>(() => {
    try {
      const stored = localStorage.getItem(CREDITS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [globalRemaining, setGlobalRemaining] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(GLOBAL_CREDITS_KEY);
      if (stored !== null) {
        const val = parseInt(stored, 10);
        return isNaN(val) ? FREE_MESSAGES : Math.min(val, FREE_MESSAGES);
      }
    } catch { /* empty */ }
    return FREE_MESSAGES;
  });

  // Prevent concurrent verification calls
  const verifyingRef = useRef(false);

  // ── Server verification ───────────────────────────────────────────────────
  // Queries the RLS-protected user_subscriptions table.
  // RLS policy: user_id = auth.uid()::text  — users can only see their own rows.
  // Returns true only if the DB has an active, non-expired subscription for this user.
  const verifySubscriptionFromServer = useCallback(async (): Promise<boolean> => {
    if (verifyingRef.current) return serverVerified;
    verifyingRef.current = true;
    setIsVerifying(true);

    try {
      // Confirm we have an active session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        // Not authenticated — cannot have a server-verified subscription
        setServerVerified(false);
        return false;
      }

      const now = new Date().toISOString();

      // Query user_subscriptions — RLS ensures we only see our own rows
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('website_plan_id, status, payment_status, end_date')
        .eq('status', 'active')
        .eq('payment_status', 'completed')
        .gt('end_date', now)
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[Subscription] Server verification query error:', error.message);
        // On query error: fail closed — do not grant premium access
        setServerVerified(false);
        return false;
      }

      if (data) {
        // Active subscription confirmed server-side
        const plan = data.website_plan_id as SubscriptionPlan;
        const endDate = data.end_date as string;

        console.log('[Subscription] Server verified active subscription:', plan, 'expires:', endDate);

        // Sync localStorage cache with authoritative server data
        const serverState: SubscriptionState = {
          isSubscribed: true,
          plan,
          expiresAt: endDate,
        };
        setSubscription(serverState);
        localStorage.setItem(SUB_KEY, JSON.stringify(serverState));
        setServerVerified(true);
        return true;
      } else {
        // No active subscription in DB
        console.log('[Subscription] No active subscription found on server');
        // Clear stale localStorage cache if it claimed an active subscription
        if (subscription.isSubscribed) {
          console.log('[Subscription] Clearing stale localStorage subscription cache');
          setSubscription(DEFAULT_STATE);
          localStorage.removeItem(SUB_KEY);
        }
        setServerVerified(false);
        return false;
      }
    } catch (err) {
      console.error('[Subscription] Server verification exception:', err);
      // Exception: fail closed
      setServerVerified(false);
      return false;
    } finally {
      verifyingRef.current = false;
      setIsVerifying(false);
    }
  }, [subscription.isSubscribed, serverVerified]);

  // ── Run server verification on mount and on auth state changes ────────────
  useEffect(() => {
    let mounted = true;

    const runVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        await verifySubscriptionFromServer();
      } else {
        // No session — cannot be server-verified
        setServerVerified(false);
      }
    };

    runVerification();

    // Re-verify on auth state changes (login / token refresh / logout)
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(() => {
          if (mounted) runVerification();
        }, 500); // slight delay to ensure session is fully established
      } else if (event === 'SIGNED_OUT') {
        setServerVerified(false);
        setSubscription(DEFAULT_STATE);
        localStorage.removeItem(SUB_KEY);
      }
    });

    return () => {
      mounted = false;
      authSub.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-verify periodically to catch expiry and cancellations ─────────────
  useEffect(() => {
    // Re-verify every 10 minutes while the app is open
    const interval = setInterval(() => {
      verifySubscriptionFromServer();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [verifySubscriptionFromServer]);

  // ── Persist localStorage cache ────────────────────────────────────────────
  useEffect(() => {
    if (subscription.isSubscribed && subscription.expiresAt && subscription.plan) {
      localStorage.setItem(SUB_KEY, JSON.stringify(subscription));
    } else {
      localStorage.removeItem(SUB_KEY);
    }
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem(CREDITS_KEY, JSON.stringify(credits));
  }, [credits]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_CREDITS_KEY, globalRemaining.toString());
  }, [globalRemaining]);

  // ── subscribe() — called ONLY from PayPalReturn.tsx after Edge Function
  //    confirms payment. paymentVerified=true is required. This is the only
  //    non-server-query path that sets serverVerified=true, and it is only
  //    reachable after the PayPal Edge Function has verified the subscription. ─
  const subscribe = useCallback((plan: SubscriptionPlan, paymentVerified: boolean): boolean => {
    if (!paymentVerified) {
      console.warn('[Subscription] subscribe() rejected: paymentVerified=false');
      return false;
    }

    const tier = subscriptionTiers.find((t) => t.id === plan);
    if (!tier) {
      console.warn('[Subscription] subscribe() rejected: invalid plan');
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + tier.durationDays * 24 * 60 * 60 * 1000);

    const newState: SubscriptionState = {
      isSubscribed: true,
      plan,
      expiresAt: expiresAt.toISOString(),
    };

    setSubscription(newState);
    // PayPal Edge Function confirmed the payment — mark as server-verified
    setServerVerified(true);
    setGlobalRemaining(FREE_MESSAGES);

    // Trigger a background server re-verification to sync with DB
    // (webhook may have already written the DB record)
    setTimeout(() => {
      verifySubscriptionFromServer();
    }, 3000);

    return true;
  }, [verifySubscriptionFromServer]);

  const clearSubscription = useCallback(() => {
    setSubscription(DEFAULT_STATE);
    setServerVerified(false);
    localStorage.removeItem(SUB_KEY);
  }, []);

  // ── isActive() — THE authoritative premium gate ───────────────────────────
  // Returns true ONLY when serverVerified=true AND the expiry hasn't passed.
  // localStorage manipulation alone cannot make this return true.
  const isActive = useCallback((): boolean => {
    if (!serverVerified) {
      return false;
    }

    // Double-check expiry (server re-verification handles this too)
    if (!subscription.isSubscribed || !subscription.expiresAt || !subscription.plan) {
      return false;
    }

    const expiryDate = new Date(subscription.expiresAt);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return false;
    }

    return true;
  }, [serverVerified, subscription]);

  const checkSubscription = useCallback((): boolean => {
    return isActive();
  }, [isActive]);

  const canSendMessage = useCallback((conversationId: number): boolean => {
    if (isActive()) return true;
    const used = credits[conversationId] || 0;
    return used < FREE_MESSAGES;
  }, [isActive, credits]);

  const recordMessage = useCallback((conversationId: number) => {
    if (!isActive()) {
      setCredits((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || 0) + 1,
      }));
    }
  }, [isActive]);

  const getUserMessageCount = useCallback((conversationId: number): number => {
    return credits[conversationId] || 0;
  }, [credits]);

  const decrementMessages = useCallback(() => {
    if (!isActive()) {
      setGlobalRemaining((prev) => Math.max(0, prev - 1));
    }
  }, [isActive]);

  const getExpiryDate = useCallback((): string | null => {
    return subscription.expiresAt;
  }, [subscription]);

  const getRemainingDays = useCallback((): number => {
    if (!subscription.expiresAt) return 0;
    const diff = new Date(subscription.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  }, [subscription]);

  const getRemainingMessages = useCallback((): number => {
    if (isActive()) return Infinity;
    return Math.max(0, globalRemaining);
  }, [isActive, globalRemaining]);

  const isUserOnline = useCallback((_userId: number): boolean => {
    return isActive();
  }, [isActive]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        subscribe,
        isActive,
        checkSubscription,
        canSendMessage,
        recordMessage,
        getUserMessageCount,
        decrementMessages,
        getExpiryDate,
        getRemainingDays,
        getRemainingMessages,
        isUserOnline,
        clearSubscription,
        isVerifying,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription(): SubscriptionContextType {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
