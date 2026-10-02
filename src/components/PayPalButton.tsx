import React, { useState } from 'react';
import { Loader2, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { SubscriptionPlan } from '../types/subscription';
import { createSubscriptionOrder } from '../services/paypalApi';

interface PayPalButtonProps {
  plan: SubscriptionPlan;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const PLAN_DURATIONS: Record<SubscriptionPlan, string> = {
  weekly: '7 days',
  monthly: '30 days',
  yearly: '365 days',
};

const PayPalButton: React.FC<PayPalButtonProps> = ({ plan, amount, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayPalClick = async () => {
    setIsLoading(true);
    setError(null);

    // STEP 1: Open popup SYNCHRONOUSLY within the click event, BEFORE any await
    // This is critical to avoid popup blockers
    const popupWidth = 500;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;
    
    const popup = window.open(
      'about:blank',
      'PayPalCheckout',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    // STEP 2: Write a loading state to the popup immediately
    if (popup) {
      try {
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Connecting to PayPal...</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
                }
                .container {
                  text-align: center;
                  padding: 40px;
                }
                .spinner {
                  width: 50px;
                  height: 50px;
                  border: 4px solid #e0e0e0;
                  border-top-color: #0070ba;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin: 0 auto 24px;
                }
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
                h2 {
                  color: #2c3e50;
                  font-size: 20px;
                  margin-bottom: 12px;
                }
                p {
                  color: #7f8c8d;
                  font-size: 14px;
                }
                .paypal-logo {
                  width: 100px;
                  margin-top: 24px;
                  opacity: 0.7;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="spinner"></div>
                <h2>Connecting to PayPal...</h2>
                <p>Please wait while we set up your subscription</p>
                <svg class="paypal-logo" viewBox="0 0 124 33" fill="#003087">
                  <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.37-.873-4.394-.972-1.117-2.696-1.707-4.984-1.707zm.789 6.405c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.949 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.227 5.031.998 1.163 2.426 1.646 4.127 1.646 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.771-11.209a.568.568 0 0 0-.561-.658zm-4.594 6.378c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.516-2.301.295-1.838 1.805-3.121 3.67-3.121.93 0 1.686.309 2.184.892.499.585.697 1.408.556 2.286zM84.096 13.075h-3.291a.953.953 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.95.95 0 0 0-.908-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.463-.895z"/>
                  <path fill="#009cde" d="M94.992 6.749h-6.84a.95.95 0 0 0-.939.802l-2.766 17.537a.568.568 0 0 0 .562.658h3.51a.667.667 0 0 0 .658-.562l.785-4.971a.948.948 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.37-.873-4.394-.971-1.117-2.693-1.707-4.984-1.707zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.469 1.044.331 1.906zM115.73 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.312 6.586-.312 1.918.133 3.752 1.227 5.031 1 1.163 2.426 1.646 4.127 1.646 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.951a.95.95 0 0 0 .938-.803l1.771-11.209a.57.57 0 0 0-.564-.658zm-4.592 6.378c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.293-1.838 1.803-3.121 3.67-3.121.93 0 1.684.309 2.182.892.502.585.7 1.408.556 2.286zM119.066 7.233l-2.807 17.855a.568.568 0 0 0 .562.658h2.822a.95.95 0 0 0 .938-.803l2.77-17.537a.57.57 0 0 0-.562-.658h-3.16a.57.57 0 0 0-.563.485z"/>
                </svg>
              </div>
            </body>
          </html>
        `);
        popup.document.close();
      } catch (e) {
        console.warn('[PayPal Button] Could not write to popup:', e);
      }
    }

    try {
      console.log(`[PayPal Button] Starting checkout for plan: ${plan}`);
      
      // STEP 3: Now perform the async operation (after popup is already open)
      const orderResponse = await createSubscriptionOrder(plan);

      console.log(`[PayPal Button] Order response:`, orderResponse);

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create subscription');
      }

      if (!orderResponse.approvalUrl) {
        throw new Error('No approval URL received from PayPal');
      }

      const approvalUrl = orderResponse.approvalUrl;
      console.log(`[PayPal Button] URL domain:`, new URL(approvalUrl).hostname);
      
      localStorage.setItem('heartsync_pending_plan', plan);
      localStorage.setItem('heartsync_pending_amount', amount.toString());

      onSuccess();
      
      // STEP 4: Navigate the already-open popup to the PayPal approval URL
      if (popup && !popup.closed) {
        console.log(`[PayPal Button] Navigating popup to PayPal approval URL...`);
        popup.location.href = approvalUrl;
        
        // Optional: Focus the popup
        popup.focus();
      } else {
        // STEP 5: Fallback if popup was closed or blocked
        console.log(`[PayPal Button] Popup not available, redirecting main window...`);
        window.location.href = approvalUrl;
      }

    } catch (err) {
      console.error('[PayPal Button] Checkout error:', err);
      
      // Close the popup if there was an error
      if (popup && !popup.closed) {
        try {
          popup.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handlePayPalClick();
  };

  return (
    <div className="w-full space-y-3">
      <button
        onClick={handlePayPalClick}
        disabled={isLoading}
        className="w-full py-4 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting to PayPal...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 4.003-.028.15a.806.806 0 01-.795.68h-2.31a.556.556 0 01-.548-.645l1.188-7.552h-.001a.806.806 0 01.794-.68h2.31c3.238 0 5.774-1.314 6.514-5.12.256-1.313.192-2.447-.3-3.327-.492-.88-1.314-1.47-2.46-1.856z" />
            </svg>
            <span>Pay with PayPal</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-heartsync mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-heartsync font-medium mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 text-xs text-heartsync hover:text-heartsync-dark font-semibold bg-white px-3 py-1.5 rounded-full border border-heartsync/20 hover:border-heartsync/40 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock className="w-3 h-3" />
        <span>Secured by PayPal</span>
      </div>

      <p className="text-center text-[10px] text-gray-400">
        {PLAN_NAMES[plan]} plan · {PLAN_DURATIONS[plan]} · ${amount.toFixed(2)} USD
      </p>
    </div>
  );
};

export default PayPalButton;
