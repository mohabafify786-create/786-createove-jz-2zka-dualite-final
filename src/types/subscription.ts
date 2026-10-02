export type SubscriptionPlan = 'weekly' | 'monthly' | 'yearly';

export interface SubscriptionTier {
  id: SubscriptionPlan;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  durationDays: number;
  savings: string;
  features: string[];
  popular?: boolean;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
}
