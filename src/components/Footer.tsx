import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Globe, Shield } from 'lucide-react';
import SupportEmailLink from './SupportEmailLink';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="w-7 h-7 text-heartsync fill-heartsync" />
              <span className="text-xl font-extrabold">
                Heart<span className="text-heartsync">sync</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Find your perfect match with HeartSync. AI-powered dating for meaningful connections.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-heartsync transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <SupportEmailLink 
                aria-label="Email support at supportheartsyncone@gmail.com" 
                className="p-2 bg-gray-800 rounded-full hover:bg-heartsync transition-colors"
              >
                <Mail className="w-4 h-4" />
              </SupportEmailLink>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-heartsync transition-colors">
                <Shield className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li><Link to="/discover" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Discover</Link></li>
              <li><Link to="/messages" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Messages</Link></li>
              <li><Link to="/profile" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-2.5">
              <li><Link to="/help-center" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Help Center</Link></li>
              <li><Link to="/safety-tips" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Safety Tips</Link></li>
              <li><Link to="/community-guidelines" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Community Guidelines</Link></li>
              <li><Link to="/success-stories" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Terms</Link></li>
              <li><Link to="/cookies" className="text-gray-400 text-sm hover:text-heartsync transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">&copy; 2025 HeartSync. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <Link to="/privacy" className="text-gray-500 hover:text-heartsync transition-colors">Privacy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-heartsync transition-colors">Terms</Link>
            <Link to="/cookies" className="text-gray-500 hover:text-heartsync transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
