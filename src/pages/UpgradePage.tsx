import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Shield, Star, MessageCircle, Heart, Eye } from 'lucide-react';
import { subscriptionTiers } from '../data/subscriptionTiers';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import SubscriptionModal from '../components/SubscriptionModal';

const UpgradePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { isActive, subscription, getRemainingDays } = useSubscription();
  const { t } = useLanguage();
  const subscribed = isActive();
  const remaining = getRemainingDays();

  const perks = [
    { icon: MessageCircle, titleKey: 'upgrade.unlimitedMessages', descKey: 'upgrade.unlimitedMessagesDesc' },
    { icon: Eye, titleKey: 'upgrade.seeWhosOnline', descKey: 'upgrade.seeWhosOnlineDesc' },
    { icon: Heart, titleKey: 'upgrade.unlimitedLikes', descKey: 'upgrade.unlimitedLikesDesc' },
    { icon: Star, titleKey: 'upgrade.superLikes', descKey: 'upgrade.superLikesDesc' },
    { icon: Shield, titleKey: 'upgrade.prioritySupport', descKey: 'upgrade.prioritySupportDesc' },
    { icon: Crown, titleKey: 'upgrade.vipBadge', descKey: 'upgrade.vipBadgeDesc' },
  ];

  return (
    <div className="min-h-[80vh] bg-surface-muted pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        {subscribed ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-10"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">{t('upgrade.yourePremium')}</h1>
            <p className="text-gray-500">
              {subscription.plan?.charAt(0).toUpperCase()}{subscription.plan?.slice(1)} {t('profile.planDaysRemaining').replace('plan', '').replace('·', '')} {remaining}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-10"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-yellow-500/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">{t('upgrade.title')}</h1>
            <p className="text-gray-500 max-w-md mx-auto">
              {t('upgrade.subtitle')}
            </p>
          </motion.div>
        )}

        {!subscribed && (
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {subscriptionTiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative card p-6 text-center cursor-pointer hover:shadow-lg transition-all ${
                  tier.popular ? 'border-heartsync ring-2 ring-heartsync/20' : ''
                }`}
                onClick={() => setShowModal(true)}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-heartsync text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-bold text-black mb-1">{tier.name}</h3>
                <p className="text-3xl font-extrabold text-heartsync">${tier.price}</p>
                <p className="text-xs text-gray-400 line-through">${tier.originalPrice}</p>
                <span className="inline-block mt-2 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  {tier.savings}
                </span>
                <p className="text-xs text-gray-500 mt-2">{tier.duration}</p>
                <ul className="mt-4 space-y-2 text-left">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-5 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors active:scale-[0.98]">
                  {t('upgrade.choosePlan')} {tier.name}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-bold text-black text-center mb-6">
            {subscribed ? t('upgrade.yourPremiumPerks') : t('upgrade.whatYouGet')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <perk.icon className="w-5 h-5 text-heartsync" />
                </div>
                <div>
                  <h3 className="font-semibold text-black text-sm">{t(perk.titleKey)}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{t(perk.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {!subscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center bg-gradient-to-br from-black to-gray-900"
          >
            <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t('upgrade.readyToFind')}</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {t('upgrade.joinPremium')}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3.5 bg-heartsync text-white font-bold rounded-full hover:bg-heartsync-dark transition-colors shadow-lg shadow-heartsync/30 active:scale-[0.98]"
            >
              <Crown className="w-4 h-4 inline mr-2" />
              {t('upgrade.upgradeNow')}
            </button>
          </motion.div>
        )}
      </div>

      <SubscriptionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default UpgradePage;
