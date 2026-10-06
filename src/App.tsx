import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { reportWebVitals } from './utils/performanceUtils';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Static page imports ensuring single unified React instance across all routes
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import UpgradePage from './pages/UpgradePage';
import SettingsPage from './pages/SettingsPage';
import PayPalReturn from './pages/PayPalReturn';
import HelpCenterPage from './pages/HelpCenterPage';
import SafetyTipsPage from './pages/SafetyTipsPage';
import CommunityGuidelinesPage from './pages/CommunityGuidelinesPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// App routes
function AppRoutes() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/safety-tips" element={<SafetyTipsPage />} />
            <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
            <Route path="/success-stories" element={<SuccessStoriesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <DiscoverPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <ProtectedRoute>
                  <MatchesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upgrade" 
              element={
                <ProtectedRoute>
                  <UpgradePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/paypal/return" 
              element={
                <ProtectedRoute>
                  <PayPalReturn />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Main App component
function App() {
  useEffect(() => {
    // Report Web Vitals for performance monitoring
    reportWebVitals((metric) => {
      console.log(`[Performance] ${metric.name}:`, metric.value.toFixed(2), 'ms');
    });
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Router>
              <ScrollToTop />
              <AppRoutes />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
