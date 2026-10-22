import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle, Crown, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { captureSubscription } from '../services/paypalApi';
import { useSubscription } from '../context/SubscriptionContext';

const PayPalReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscribe } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending_settlement' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const isProcessingRef = useRef(false);

  const processPayment = useCallback(async () => {
    try {
      const subscriptionId = searchParams.get('subscription_id') || searchParams.get('token');
      const pendingPlan = localStorage.getItem('heartsync_pending_plan') as 'weekly' | 'monthly' | 'yearly' | null;

      if (!subscriptionId) {
        throw new Error('No subscription ID returned from PayPal');
      }

      setStatus('loading');
      setMessage('Verifying your subscription with PayPal...');

      // Attempt verification with polling for APPROVED -> ACTIVE transition
      let attempts = 0;
      const maxAttempts = 3;
      let lastResult: Awaited<ReturnType<typeof captureSubscription>> | null = null;

      while (attempts < maxAttempts) {
        attempts++;
        setRetryCount(attempts);
        console.log(`[PayPal Return] Verification attempt ${attempts}/${maxAttempts} for ${subscriptionId}`);

        const result = await captureSubscription(subscriptionId);
        lastResult = result;

        if (result.success && result.status === 'ACTIVE') {
          // Authoritative ACTIVE status
          setStatus('success');
          setMessage('Subscription activated successfully!');

          if (pendingPlan) {
            subscribe(pendingPlan, true);
          }

          localStorage.removeItem('heartsync_pending_plan');
          localStorage.removeItem('heartsync_pending_amount');

          setTimeout(() => {
            navigate('/discover');
          }, 2500);
          return;
        }

        // If PayPal says APPROVED or PENDING, it's not ready yet
        if (result.status === 'APPROVED' || result.status === 'APPROVAL_PENDING' || result.status === 'PENDING') {
          if (attempts < maxAttempts) {
            // Wait 2 seconds before retrying
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
        } else {
          // Explicit terminal status (CANCELLED, SUSPENDED, EXPIRED, etc.)
          throw new Error(result.error || result.message || 'Payment verification failed');
        }
      }

      // If loop exited and status is still APPROVED or PENDING, show graceful pending screen
      if (lastResult && (lastResult.status === 'APPROVED' || lastResult.status === 'APPROVAL_PENDING' || lastResult.status === 'PENDING')) {
        setStatus('pending_settlement');
        setMessage(
          'Your subscription has been approved! PayPal is currently finalizing the initial payment capture. Your premium features will activate automatically as soon as PayPal completes the transaction.'
        );
        localStorage.removeItem('heartsync_pending_plan');
        localStorage.removeItem('heartsync_pending_amount');
      } else {
        throw new Error(lastResult?.error || lastResult?.message || 'Payment verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Payment processing failed');
    }
  }, [searchParams, navigate, subscribe]);

  useEffect(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    processPayment();
  }, [processPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-muted to-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-heartsync to-heartsync-dark flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-black mb-2">Processing Payment</h2>
            <p className="text-gray-500 mb-2">{message}</p>
            {retryCount > 1 && (
              <p className="text-xs text-gray-400">Verifying activation with PayPal (check {retryCount}/3)...</p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full">
              <Crown className="w-4 h-4" />
              <span>Premium features unlocked</span>
            </div>
            <p className="text-sm text-gray-400 mt-4">Redirecting to discover...</p>
          </>
        )}

        {status === 'pending_settlement' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Clock className="w-10 h-10 text-amber-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Approved</h2>
            <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-4 border border-amber-200">
              Payment Clearing with PayPal
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => processPayment()}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Re-check Activation Status
              </button>
              <button
                onClick={() => navigate('/discover')}
                className="w-full py-3 bg-heartsync text-white font-semibold rounded-xl hover:bg-heartsync-dark transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Continue to HeartSync
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-10 h-10 text-heartsync" />
            </motion.div>
            <h2 className="text-2xl font-bold text-heartsync mb-2">Payment Verification Notice</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => processPayment()}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Verification
              </button>
              <button
                onClick={() => navigate('/upgrade')}
                className="w-full py-3 bg-heartsync text-white font-semibold rounded-xl hover:bg-heartsync-dark transition-colors text-sm"
              >
                Back to Plans
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PayPalReturn;
