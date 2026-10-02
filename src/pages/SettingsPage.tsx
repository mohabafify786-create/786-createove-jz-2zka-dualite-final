import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, LogOut, Trash2, AlertTriangle, X, Check, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
