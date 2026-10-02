import React from 'react';
import { Cookie, Settings, Shield, Info, AlertTriangle } from 'lucide-react';
import InfoPageLayout from '../components/InfoPageLayout';

const CookiesPage: React.FC = () => {
  return (
    <InfoPageLayout
      title="Cookie Policy"
      subtitle="How HeartSync uses cookies and similar technologies"
    >
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cookie className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">What Are Cookies?</h2>
          </div>
          <p className="text-gray-700">
            Cookies are small text files stored on your device when you visit our website.
            They help us provide a better experience by remembering your preferences and
            maintaining your login session.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Cookies We Use</h2>
          </div>
          <div className="text-gray-700 space-y-3">
            <div className="p-4 bg-surface-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Essential</span>
                <h3 className="font-medium text-black">Authentication Cookies</h3>
              </div>
              <p className="text-sm">
                Required for you to sign in and stay signed in to your HeartSync account.
                These cookies remember your login state and are necessary for the service to function.
                Without these cookies, you would need to sign in again on every page.
              </p>
            </div>
            
            <div className="p-4 bg-surface-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Essential</span>
                <h3 className="font-medium text-black">Security Cookies</h3>
              </div>
              <p className="text-sm">
                Help protect your account and session from unauthorized access.
                These cookies support security features that keep your account safe.
              </p>
            </div>
            
            <div className="p-4 bg-surface-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Functional</span>
                <h3 className="font-medium text-black">Preference Cookies</h3>
              </div>
              <p className="text-sm">
                Remember your settings and preferences, such as your language selection.
                These improve your experience but are not strictly necessary.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">What We Do NOT Use</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>HeartSync currently does <strong>not</strong> use:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Third-party advertising cookies</li>
              <li>Social media tracking cookies</li>
              <li>Analytics cookies from third-party services</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              If we add additional cookie types in the future, we will update this policy and provide appropriate controls.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Managing Cookies</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>View cookies stored on your device</li>
              <li>Block third-party cookies</li>
              <li>Delete cookies after each session</li>
              <li>Block all cookies</li>
            </ul>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mt-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Blocking essential cookies will prevent you from signing in and using HeartSync properly. We recommend keeping essential cookies enabled.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Third-Party Services</h2>
          </div>
          <p className="text-gray-700">
            HeartSync uses Supabase for backend services and PayPal for payment processing. 
            These services may set their own cookies as part of their normal operation. 
            Please refer to their respective privacy policies for more information.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cookie className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Local Storage</h2>
          </div>
          <p className="text-gray-700">
            In addition to cookies, HeartSync uses browser local storage to save certain preferences 
            and improve performance. This includes your language preference and temporary session data.
            You can clear local storage through your browser's developer tools or by clearing site data.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last updated: January 2025
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default CookiesPage;
