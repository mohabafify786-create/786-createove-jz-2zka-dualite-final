import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Scale, RefreshCw, Users, CreditCard, Shield, Ban, Mail, Bot, Heart } from 'lucide-react';
import InfoPageLayout from '../components/InfoPageLayout';

const TermsPage: React.FC = () => {
  return (
    <InfoPageLayout
      title="Terms of Service"
      subtitle="Terms and conditions for using HeartSync"
    >
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              <strong>Agreement to Terms:</strong> By creating an account and using HeartSync, you agree to these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Eligibility</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>To use HeartSync, you must:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Be at least 18 years old</li>
              <li>Provide accurate registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not be prohibited from using the service under applicable laws</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">AI Companions & Profiles</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> HeartSync features AI-generated companion profiles designed for entertainment and companionship. These profiles are operated by artificial intelligence and do not represent real human users seeking romantic relationships.
                </p>
              </div>
            </div>
            <p>By using HeartSync, you understand and agree that:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Many profiles on the platform are AI-generated companions</li>
              <li>Conversations with AI companions are simulated interactions</li>
              <li>AI companions are provided for entertainment purposes</li>
              <li>Real human users may also be present on the platform</li>
              <li>You should not share sensitive personal information with any user or AI companion</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Your Responsibilities</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>As a HeartSync user, you agree to:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Provide accurate and truthful profile information</li>
              <li>Use the service respectfully and lawfully</li>
              <li>Not impersonate others or create fake profiles</li>
              <li>Not engage in harassment, hate speech, or harmful behavior</li>
              <li>Not attempt to scam, defraud, or deceive other users</li>
              <li>Not share explicit content without appropriate consent</li>
              <li>Not use automated systems to access the platform</li>
              <li>Report violations of these terms when encountered</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Ban className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Prohibited Activities</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>You may not:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Use the service for any illegal purpose</li>
              <li>Harass, abuse, stalk, or harm other users</li>
              <li>Share or request explicit content inappropriately</li>
              <li>Attempt to scam or defraud others, including asking for money</li>
              <li>Share others' private information without consent</li>
              <li>Create accounts if you have been previously banned</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Subscriptions & Payments</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>For premium subscriptions:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Payments are processed securely through PayPal</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Upon cancellation, premium features remain active until the end of your billing period</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>Prices are subject to change with reasonable notice</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Account Termination</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>We reserve the right to:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Suspend or terminate accounts that violate these terms</li>
              <li>Remove content that violates our Community Guidelines</li>
              <li>Refuse service to anyone for any reason</li>
            </ul>
            <p className="mt-3">
              You may delete your account at any time through the Settings page. Account deletion removes your profile, messages, and matches permanently.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Disclaimers & Limitations</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>HeartSync is provided "as is" without warranties of any kind</li>
              <li>We do not guarantee the accuracy of profile information</li>
              <li>We are not responsible for interactions between users</li>
              <li>We do not guarantee that you will find a match or connection</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Changes to Terms</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              We may modify these terms at any time. We will notify users of significant changes through the app or via email. 
              Continued use of HeartSync after changes constitutes acceptance of the updated terms.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-heartsync" />
            <h2 className="text-lg font-semibold text-black">Contact Us</h2>
          </div>
          <div className="text-gray-700 space-y-2">
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="p-4 bg-surface-muted rounded-xl mt-2">
              <p className="font-medium text-black">HeartSync Support</p>
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
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default TermsPage;
