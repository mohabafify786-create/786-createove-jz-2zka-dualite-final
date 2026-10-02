import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Calendar, Globe, Smartphone, MessageCircle, Trash2, AlertTriangle } from 'lucide-react';
import InfoPageLayout from '../components/InfoPageLayout';

const PrivacyPage: React.FC = () => {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      subtitle="How we handle your information on HeartSync"
    >
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              <strong>Your Privacy Matters:</strong> HeartSync is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights regarding your information.
            </p>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Information We Collect</h2>
          </div>
          <div className="text-gray-700 space-y-3">
            <p>We collect information you provide directly when using HeartSync:</p>
            
            <div className="space-y-3 ml-2">
              <div className="p-3 bg-surface-muted rounded-lg">
                <h4 className="font-medium text-black mb-1">Account Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Name, email address, and date of birth (for age verification)</li>
                  <li>Gender and preferences for matching</li>
                  <li>Location information (city/region you provide)</li>
                </ul>
              </div>
              
              <div className="p-3 bg-surface-muted rounded-lg">
                <h4 className="font-medium text-black mb-1">Profile Content</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Photos you upload to your profile</li>
                  <li>Bio text and interests you choose to share</li>
                  <li>Profile preferences and settings</li>
                </ul>
              </div>
              
              <div className="p-3 bg-surface-muted rounded-lg">
                <h4 className="font-medium text-black mb-1">Activity Data</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Messages sent through the platform</li>
                  <li>Matches and interactions with profiles</li>
                  <li>Subscription and payment information (processed securely by PayPal)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">How We Use Your Information</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Create and maintain your HeartSync account</li>
              <li>Show you compatible profiles based on your preferences</li>
              <li>Enable messaging and connections with other users</li>
              <li>Process subscription payments for premium features</li>
              <li>Send important account notifications and updates</li>
              <li>Improve our service and user experience</li>
              <li>Ensure platform safety and prevent abuse</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Third-Party Services</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>HeartSync uses the following third-party services:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>Supabase:</strong> Backend infrastructure for authentication, database, and storage</li>
              <li><strong>PayPal:</strong> Payment processing for premium subscriptions</li>
            </ul>
            <p className="text-sm mt-2">
              These providers have their own privacy policies and security measures. We only share information necessary to provide the service.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Data Security</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure authentication with Supabase</li>
              <li>Payment processing through PayPal's secure systems</li>
            </ul>
            <p className="text-sm mt-2 text-gray-500">
              While we take security seriously, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Data Retention</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>We retain your information for as long as your account is active. When you delete your account:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Your profile and personal information are removed from our active database</li>
              <li>Your messages and matches are deleted</li>
              <li>Some anonymized, aggregated data may be retained for analytics</li>
              <li>Backup copies may be retained for a limited time before permanent deletion</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Your Privacy Rights</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Access your personal information through your profile settings</li>
              <li>Update or correct your profile information at any time</li>
              <li>Delete your account through the Settings page</li>
              <li>Request information about how your data has been used</li>
            </ul>
            <p className="mt-3">
              To exercise these rights or ask privacy-related questions, contact us at:
            </p>
            <div className="mt-2">
              <a
                href="mailto:supportheartsyncone@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-heartsync text-white font-medium rounded-full hover:bg-heartsync-dark transition-colors"
              >
                <Mail className="w-4 h-4" />
                supportheartsyncone@gmail.com
              </a>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Cookies</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              HeartSync uses essential cookies to maintain your login session and provide core functionality. 
              For more details, see our <Link to="/cookies" className="text-heartsync hover:underline">Cookie Policy</Link>.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Children's Privacy</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              HeartSync is intended for users 18 years and older. We do not knowingly collect information from children. 
              If you believe a child has provided us with personal information, please contact us immediately.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Contact Us</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="p-4 bg-surface-muted rounded-xl mt-2">
              <p className="font-medium text-black">HeartSync Privacy Team</p>
              <a href="mailto:supportheartsyncone@gmail.com" className="text-heartsync hover:underline">
                supportheartsyncone@gmail.com
              </a>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last updated: January 2025
          </p>
          <p className="text-xs text-gray-400 mt-1">
            We may update this Privacy Policy from time to time. We will notify users of significant changes through the app or via email.
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default PrivacyPage;
