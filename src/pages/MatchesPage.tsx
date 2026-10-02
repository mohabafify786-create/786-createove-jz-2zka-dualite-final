import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, MapPin, Clock, Lock } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import SubscriptionModal from '../components/SubscriptionModal';

interface Match {
  id: number;
  name: string;
  age: number;
  image: string;
  location: string;
  lastActive: string;
  isNew: boolean;
}

const generateMatches = (): Match[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: faker.person.firstName(),
    age: faker.number.int({ min: 22, max: 35 }),
    image: `https://images.unsplash.com/photo-${1494790108377 + i * 100000}?w=200&h=200&fit=crop`,
    location: faker.location.city(),
    lastActive: faker.helpers.arrayElement(['Just now', '5m ago', '1h ago', '2h ago', 'Today']),
    isNew: i < 3,
  }));
};

const MatchesPage: React.FC = () => {
  const [matches] = useState<Match[]>(() => generateMatches());
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { checkSubscription } = useSubscription();
  const { t } = useLanguage();
  const isSubscribed = checkSubscription();

  const handleChatClick = () => {
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{t('matches.title')}</h1>
          <p className="text-gray-600">{t('matches.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="relative">
                <img
                  src={`https://images.unsplash.com/photo-${1494790108377 + match.id * 100000}?w=300&h=400&fit=crop`}
                  alt={match.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {match.isNew && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {t('matches.new')}
                  </div>
                )}
                {!isSubscribed && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleChatClick}
                      className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors">
                      <User className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-black">
                  {match.name}, {match.age}
                </h3>
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{match.location}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {isSubscribed ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-500">{t('messages.onlineNow')}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{match.lastActive}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};

export default MatchesPage;
