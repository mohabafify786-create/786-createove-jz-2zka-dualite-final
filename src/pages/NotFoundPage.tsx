import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import HeartSyncLogo from '../components/HeartSyncLogo';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <HeartSyncLogo size={56} className="justify-center mb-8" />
        
        <div className="mb-8">
          <h1 className="text-8xl font-extrabold text-heartsync mb-4">404</h1>
          <h2 className="text-2xl font-bold text-black mb-2">Page Not Found</h2>
          <p className="text-gray-500">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-heartsync text-white font-semibold rounded-full hover:bg-heartsync-dark transition-colors shadow-lg shadow-heartsync/20"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            <Search className="w-4 h-4" />
            Discover Matches
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-4 inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
