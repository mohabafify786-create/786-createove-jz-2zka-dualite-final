import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2, Mail, AlertCircle } from 'lucide-react';
import HeartSyncLogo from '../components/HeartSyncLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        const result = await register(name.trim(), email.trim(), password);
        if (result.success) {
          if (result.error) {
            setSuccess(result.error);
            setMode('signin');
          } else {
            navigate('/discover');
          }
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      } else {
        const result = await login(email.trim(), password);
        if (result.success) {
          navigate('/discover');
        } else {
          setError(result.error || 'Sign in failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('[Auth] Submit error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-muted flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-heartsync via-heartsync to-heartsync-dark relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-center text-white">
          <HeartSyncLogo size={80} showText={false} className="justify-center mb-6" />
          <h1 className="text-4xl font-extrabold mb-4">Welcome to HeartSync</h1>
          <p className="text-xl text-red-100 max-w-md mx-auto">Where meaningful connections begin. Find your perfect match today.</p>
          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold">2M+</p>
              <p className="text-sm text-red-200">{t('landing.activeUsers')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">500K+</p>
              <p className="text-sm text-red-200">{t('landing.matchesMade')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">50+</p>
              <p className="text-sm text-red-200">{t('landing.countries')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <HeartSyncLogo size={48} className="justify-center" textSize="text-2xl" />
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-black mb-1">
              {mode === 'signup' ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'signup' ? t('auth.startJourney') : t('auth.signInToContinue')}
            </p>

            <div className="flex bg-surface-muted rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
                }`}
              >
                {t('auth.signUp')}
              </button>
              <button
                onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === 'signin' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
                }`}
              >
                {t('auth.signIn')}
              </button>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2"
              >
                <Mail className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('auth.fullName')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.minCharacters')}
                    className="input-field !pr-10"
                    disabled={loading}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-heartsync mt-0.5 flex-shrink-0" />
                  <p className="text-heartsync text-sm">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-heartsync text-white font-bold rounded-xl hover:bg-heartsync-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-heartsync/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {t('auth.byContinuing')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
