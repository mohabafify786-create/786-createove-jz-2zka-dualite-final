import React from 'react';
import { Heart, Star, Quote, Mail } from 'lucide-react';
import InfoPageLayout from '../components/InfoPageLayout';

const SuccessStoriesPage: React.FC = () => {
  return (
    <InfoPageLayout
      title="Success Stories"
      subtitle="Real connections made on HeartSync"
    >
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-heartsync fill-heartsync" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">Finding Connection, One Match at a Time</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            HeartSync brings people together. Every day, meaningful connections are formed
            through our platform. Here's what makes HeartSync special.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <Quote className="w-6 h-6 text-heartsync/30 mb-2" />
            <p className="text-gray-700 text-sm italic mb-3">
              "The smart matching really works. I found someone I genuinely connect with and 
              we've been talking every day since!"
            </p>
            <p className="text-xs text-gray-500">— A HeartSync member</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <Quote className="w-6 h-6 text-heartsync/30 mb-2" />
            <p className="text-gray-700 text-sm italic mb-3">
              "I was skeptical about online dating, but HeartSync felt different.
              The quality of conversations and people here is amazing."
            </p>
            <p className="text-xs text-gray-500">— A HeartSync member</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-black mb-4">Why HeartSync Works</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-heartsync/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-heartsync text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-black">Smart Matching</h3>
                <p className="text-sm text-gray-600">Our algorithm suggests people who share your interests and values.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-heartsync/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-heartsync text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-black">Quality Profiles</h3>
                <p className="text-sm text-gray-600">Verified profiles mean you're connecting with real people.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-heartsync/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-heartsync text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-black">Safe Environment</h3>
                <p className="text-sm text-gray-600">Strong moderation and safety features protect our community.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 mb-4">Ready to start your own success story?</p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-heartsync text-white font-semibold rounded-full hover:bg-heartsync-dark transition-colors"
          >
            <Heart className="w-4 h-4" />
            Get Started
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export default SuccessStoriesPage;
