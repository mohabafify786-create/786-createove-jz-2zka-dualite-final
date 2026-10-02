import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, User, Menu, X, LogOut, Crown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeartSyncLogo from './HeartSyncLogo';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { isActive } = useSubscription();
  const { t } = useLanguage();
  const subscribed = isActive();

  const isAuthPage = location.pathname === '/auth';
  const isLanding = location.pathname === '/';

  const tabs = [
    { path: '/discover', label: t('nav.discover'), icon: Search },
    { path: '/messages', label: t('nav.messages'), icon: MessageCircle, badge: !subscribed ? 3 : 0 },
    { path: '/upgrade', label: t('nav.upgrade'), icon: Crown, highlight: !subscribed },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  const active = (path: string) => location.pathname === path;

  if (isAuthPage) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={isAuthenticated ? '/discover' : '/'} className="flex-shrink-0 hover:opacity-90 transition-opacity">
              <HeartSyncLogo size={36} />
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        active(tab.path)
                          ? 'bg-heartsync text-white shadow-md shadow-heartsync/20'
                          : tab.highlight && !subscribed
                            ? 'text-gray-700 hover:bg-surface-muted bg-yellow-50'
                            : 'text-gray-500 hover:text-black hover:bg-surface-muted'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{tab.label}</span>
                      {tab.badge && tab.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-heartsync text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                      {tab.highlight && !subscribed && !active(tab.path) && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[9px] font-bold rounded-full animate-pulse">
                          UPGRADE
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-3">
              {!isAuthenticated && !isAuthPage && (
                <>
                  <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-black transition-colors">
                    {t('nav.signIn')}
                  </Link>
                  <Link to="/auth" className="btn-primary text-sm !py-2 !px-5">
                    {t('nav.getStarted')}
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-heartsync transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-surface-muted transition-colors"
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active(tab.path) ? 'bg-heartsync text-white' : 'text-gray-600 hover:bg-surface-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.highlight && !subscribed && !active(tab.path) && (
                        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[10px] font-bold rounded-full">
                          UPGRADE
                        </span>
                      )}
                    </Link>
                  );
                })}
                <button
                  onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-heartsync transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('nav.logOut')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden safe-bottom">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative flex flex-col items-center gap-0.5 py-1 px-3 ${
                    active(tab.path) ? 'text-heartsync' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute top-0 right-1 w-4 h-4 bg-heartsync text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && !subscribed && !active(tab.path) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
