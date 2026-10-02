import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import HeartSyncLogo from '../components/HeartSyncLogo';

interface ErrorPageProps {
  errorCode?: number;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  errorCode = 500, 
  title = "Something Went Wrong",
  message = "We're experiencing some technical difficulties. Please try again later."
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <HeartSyncLogo size={56} className="justify-center mb-8" />
        
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-heartsync" />
        </div>

        <h1 className="text-6xl font-extrabold text-gray-300 mb-2">{errorCode}</h1>
        <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
        <p className="text-gray-500 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-heartsync text-white font-semibold rounded-full hover:bg-heartsync-dark transition-colors shadow-lg shadow-heartsync/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-400 mb-2">Still having issues?</p>
          <a
            href="mailto:supportheartsyncone@gmail.com"
            className="inline-flex items-center gap-2 text-heartsync hover:underline text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
