import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, LogOut, Trash2, AlertTriangle, X, Check, Loader2, CheckCircle, Crown, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage, Language } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en' as Language, name: 'English' },
  { code: 'es' as Language, name: 'Español' },
  { code: 'fr' as Language, name: 'Français' },
  { code: 'de' as Language, name: 'Deutsch' },
  { code: 'tr' as Language, name: 'Türkçe' },
];

const SettingsPage: React.FC = () => {
  const { logout, deleteAccount } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isActive, subscription, getRemainingDays, cancelSubscription } = useSubscription();
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showCancelSubConfirm, setShowCancelSubConfirm] = useState(false);
  const [isCancellingSub, setIsCancellingSub] = useState(false);
  const [cancelSubMessage, setCancelSubMessage] = useState<string | null>(null);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteAccount();

    if (result.success) {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setIsDeleting(false);
      setDeleteError(result.error || 'Failed to delete account. Please try again.');
    }
  };

  if (deleteSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Account Deleted</h2>
          <p className="text-gray-500 text-sm">Your account has been deleted successfully.</p>
          <p className="text-gray-400 text-xs mt-2">Redirecting you now...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-surface-muted pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-black mb-6">{t('settings.title')}</h1>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">{t('common.profileUpdated')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Website Language */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-heartsync" />
            </div>
            <div>
              <h3 className="font-semibold text-black">{t('settings.websiteLanguage')}</h3>
              <p className="text-xs text-gray-500">{t('settings.languageDescription')}</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="input-field"
            aria-label={t('settings.websiteLanguage')}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subscription Management */}
        {isActive() && (
          <div className="card p-5 mb-4 border border-yellow-200 bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-black">
                    HeartSync {subscription.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Premium'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getRemainingDays()} days of premium access remaining
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                Active
              </span>
            </div>

            {cancelSubMessage && (
              <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                {cancelSubMessage}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Auto-renewal & billing</span>
              <button
                onClick={() => setShowCancelSubConfirm(true)}
                className="text-xs font-semibold text-heartsync hover:text-heartsync-dark hover:underline transition-colors"
              >
                Cancel Auto-Renewal
              </button>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="card p-5 mb-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black">{t('settings.signOut')}</h3>
              <p className="text-xs text-gray-500">{t('settings.signOutDescription')}</p>
            </div>
          </button>
        </div>

        {/* Delete Account */}
        <div className="card p-5 border border-red-100">
          <button
            onClick={() => { setDeleteError(null); setShowDeleteConfirm(true); }}
            className="w-full flex items-center gap-3 text-left hover:bg-red-50 p-2 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-heartsync" />
            </div>
            <div>
              <h3 className="font-semibold text-heartsync">{t('settings.deleteAccount')}</h3>
              <p className="text-xs text-gray-500">{t('settings.deleteAccountDescription')}</p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          HeartSync v1.0.0
        </p>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { if (!isDeleting) setShowDeleteConfirm(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-heartsync" />
              </div>

              <h2 className="text-xl font-bold text-black text-center mb-2">
                {t('settings.deleteConfirmTitle')}
              </h2>

              <p className="text-gray-600 text-center text-sm mb-4">
                {t('settings.deleteConfirmMessage')}
              </p>

              <AnimatePresence>
                {deleteError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                  >
                    <X className="w-4 h-4 text-heartsync flex-shrink-0 mt-0.5" />
                    <p className="text-heartsync text-xs font-medium">{deleteError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-heartsync text-white font-semibold rounded-xl hover:bg-heartsync-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('common.loading').replace('...', '')}</span>
                    </>
                  ) : (
                    <span>{t('buttons.delete')}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cancel Subscription Confirmation Modal */}
        {showCancelSubConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isCancellingSub && setShowCancelSubConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-amber-600" />
              </div>

              <h2 className="text-xl font-bold text-black text-center mb-2">
                Cancel Auto-Renewal?
              </h2>

              <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
                You will retain all premium features until your current period ends ({getRemainingDays()} days remaining). You will not be charged again.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelSubConfirm(false)}
                  disabled={isCancellingSub}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={async () => {
                    setIsCancellingSub(true);
                    const res = await cancelSubscription();
                    setIsCancellingSub(false);
                    setShowCancelSubConfirm(false);
                    setCancelSubMessage(res.message);
                    setTimeout(() => setCancelSubMessage(null), 8000);
                  }}
                  disabled={isCancellingSub}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancellingSub ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
