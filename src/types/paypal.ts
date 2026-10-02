export interface PayPalConfig {
  environment: 'sandbox' | 'live';
  clientId: string;
  webhookId?: string;
}

export interface PayPalConfigState {
  connected: boolean;
  environment: 'sandbox' | 'live' | null;
  clientIdMasked?: string;
  lastConfigured?: string;
}
