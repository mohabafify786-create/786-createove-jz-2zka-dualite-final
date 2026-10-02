import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Shield, Star, Crown } from 'lucide-react';
import { SubscriptionPlan } from '../types/subscription';
import { subscriptionTiers } from '../data/subscriptionTiers';
import PayPalButton from './PayPalButton';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTier = subscriptionTiers.find((t) => t.id === selectedPlan)!;

  const handlePayPalSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2500);
  };

  const handleError = (err: string) => {
    setError(err || 'Payment failed. Please try again.');
    setTimeout(() => setError(null), 6000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {showSuccess ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-12 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-black mb-3">Redirecting to PayPal...</h2>
                <p className="text-gray-500 mb-2">Complete your payment to activate premium</p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <Crown className="w-4 h-4" />
                  <span>{selectedTier.name} plan - {selectedTier.duration}</span>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="relative bg-gradient-to-br from-heartsync via-heartsync to-heartsync-dark p-8 text-white text-center">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <Crown className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <h2 className="text-2xl font-bold mb-1">Unlock Premium Access</h2>
                  <p className="text-red-100 text-sm">Get unlimited messages and exclusive features</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {subscriptionTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedPlan(tier.id)}
                        className={`relative p-3 rounded-2xl border-2 transition-all text-center ${
                          selectedPlan === tier.id
                            ? 'border-heartsync bg-red-50 shadow-lg shadow-heartsync/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {tier.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-heartsync text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            MOST POPULAR
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mb-1">{tier.name}</p>
                        <p className="text-xl font-bold text-black">${tier.price}</p>
                        <p className="text-[10px] text-gray-400 line-through">${tier.originalPrice}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          {tier.savings}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-surface-muted rounded-2xl p-5 mb-5">
                    <h4 className="font-bold text-black mb-3 flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-heartsync" />
                      {selectedTier.name} Plan Includes:
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedTier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-green-600" />
                          </div>
                          <span className="text-gray-700">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-center gap-5 mb-5 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-heartsync text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <PayPalButton
                        plan={selectedPlan}
                        amount={selectedTier.price}
                        onSuccess={handlePayPalSuccess}
                        onError={handleError}
                      />
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
                    By subscribing you agree to our Terms of Service and Privacy Policy. Subscription auto-renews. Cancel anytime.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
