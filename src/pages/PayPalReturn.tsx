import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle, Crown } from 'lucide-react';
import { captureSubscription } from '../services/paypalApi';
import { useSubscription } from '../context/SubscriptionContext';

const PayPalReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscribe } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const subscriptionId = searchParams.get('subscription_id') || searchParams.get('token');
        const pendingPlan = localStorage.getItem('heartsync_pending_plan') as 'weekly' | 'monthly' | 'yearly' | null;

        if (!subscriptionId) {
          throw new Error('No subscription ID returned from PayPal');
        }

        const result = await captureSubscription(subscriptionId);

        if (result.success) {
          setStatus('success');
          setMessage('Subscription activated successfully!');
          
          if (pendingPlan && result.status === 'ACTIVE') {
            subscribe(pendingPlan, true);
          }

          localStorage.removeItem('heartsync_pending_plan');
          localStorage.removeItem('heartsync_pending_amount');
          
          setTimeout(() => {
            navigate('/discover');
          }, 2500);
        } else {
          throw new Error(result.error || result.message || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Payment processing failed');
      }
    };

    processPayment();
  }, [searchParams, navigate, subscribe]);

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
            <p className="text-gray-500">Please wait while we verify your subscription...</p>
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
            <h2 className="text-2xl font-bold text-heartsync mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/upgrade')}
              className="w-full py-3 bg-heartsync text-white font-semibold rounded-xl hover:bg-heartsync-dark transition-colors"
            >
              Back to Upgrade
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PayPalReturn;
