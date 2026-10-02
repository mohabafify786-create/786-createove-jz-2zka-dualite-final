import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, CreditCard, User, Shield, Bell, ChevronRight, Search, HelpCircle, Settings, Heart, AlertCircle } from 'lucide-react';
import InfoPageLayout from '../components/InfoPageLayout';

const helpTopics = [
  { icon: User, title: 'Account Setup', description: 'Creating and managing your HeartSync profile', link: '#account-setup' },
  { icon: MessageCircle, title: 'Messaging', description: 'Sending messages and starting conversations', link: '#messaging' },
  { icon: CreditCard, title: 'Subscriptions', description: 'Premium features and payment options', link: '#subscriptions' },
  { icon: Shield, title: 'Privacy & Security', description: 'Keeping your account and data safe', link: '#privacy-security' },
  { icon: Bell, title: 'Notifications', description: 'Managing alerts and updates', link: '#notifications' },
  { icon: Mail, title: 'Contact Support', description: 'Get help from our support team', link: '#contact-support' },
];

const HelpCenterPage: React.FC = () => {
  return (
    <InfoPageLayout
      title="Help Center"
      subtitle="Find answers and get support for HeartSync"
    >
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-heartsync" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">How can we help you?</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Find answers to common questions or reach out to our support team for personalized assistance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-black mb-4">Popular Topics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {helpTopics.map((topic, index) => (
              <a
                key={index}
                href={topic.link}
                className="p-4 bg-surface-muted rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <topic.icon className="w-5 h-5 text-heartsync" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-black flex items-center gap-2">
                      {topic.title}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-heartsync transition-colors" />
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{topic.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100" id="account-setup">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-heartsync" />
            Account Setup
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Creating Your Profile</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Sign up with your email address and create a secure password</li>
                <li>Verify your email address through the confirmation link we send</li>
                <li>Add photos that represent you authentically</li>
                <li>Write a bio that shows your personality</li>
                <li>Select interests to help with matching</li>
              </ul>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Managing Your Account</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Update your profile information anytime from the Profile page</li>
                <li>Change your preferences in Settings</li>
                <li>Delete your account from Settings if needed</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100" id="messaging">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-heartsync" />
            Messaging
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Free Messaging</h3>
              <p className="text-sm">
                Free users can send a limited number of messages to start conversations. 
                Once you've used your free messages, you'll need a premium subscription to continue chatting.
              </p>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Premium Messaging</h3>
              <p className="text-sm">
                Premium subscribers enjoy unlimited messaging with all matches. 
                Upgrade to premium to unlock this and other features.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100" id="subscriptions">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-heartsync" />
            Subscriptions & Payments
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Premium Plans</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Weekly:</strong> 7 days of premium access</li>
                <li><strong>Monthly:</strong> 30 days of premium access (most popular)</li>
                <li><strong>Yearly:</strong> 365 days of premium access (best value)</li>
              </ul>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Payment Processing</h3>
              <p className="text-sm">
                All payments are processed securely through PayPal. Your payment information is never stored on our servers.
              </p>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Canceling Your Subscription</h3>
              <p className="text-sm">
                You can cancel your subscription at any time from the Settings page. 
                Your premium features will remain active until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100" id="privacy-security">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-heartsync" />
            Privacy & Security
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Keeping Your Account Safe</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use a strong, unique password for your account</li>
                <li>Never share your password with anyone</li>
                <li>Be cautious of suspicious messages asking for personal information</li>
                <li>Report any suspicious behavior through the app</li>
              </ul>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Data Protection</h3>
              <p className="text-sm">
                Your data is protected using industry-standard encryption. 
                See our <Link to="/privacy" className="text-heartsync hover:underline">Privacy Policy</Link> for full details.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100" id="notifications">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-heartsync" />
            Notifications
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-surface-muted rounded-xl">
              <h3 className="font-medium text-black mb-2">Managing Notifications</h3>
              <p className="text-sm">
                You'll receive notifications for new matches, messages, and important account updates. 
                Notification preferences can be managed through your device settings.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100" id="contact-support">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-heartsync" />
            Contact Support
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="p-6 bg-gradient-to-br from-heartsync/5 to-heartsync/10 rounded-2xl border border-heartsync/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-heartsync/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-heartsync" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black mb-1">Email Support</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Send us an email and we'll get back to you as soon as possible.
                  </p>
                  <a
                    href="mailto:supportheartsyncone@gmail.com"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-heartsync text-white font-semibold rounded-full hover:bg-heartsync-dark transition-colors shadow-lg shadow-heartsync/20"
                  >
                    <Mail className="w-4 h-4" />
                    supportheartsyncone@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 rounded-xl">
                <h4 className="font-medium text-black text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-heartsync" />
                  When contacting support, please include:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Your account email address</li>
                  <li>A clear description of your issue or question</li>
                  <li>Screenshots if relevant (never include payment card details)</li>
                </ul>
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-heartsync">
                    <strong>For your security:</strong> Never send passwords, credit card numbers, or other sensitive credentials in your email.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/safety-tips" className="text-heartsync hover:underline text-sm font-medium">
                Safety Tips →
              </Link>
              <Link to="/community-guidelines" className="text-heartsync hover:underline text-sm font-medium">
                Community Guidelines →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default HelpCenterPage;
