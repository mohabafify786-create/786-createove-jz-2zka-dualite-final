import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, Star, MapPin, Briefcase, Sparkles, CheckCircle, ChevronUp } from 'lucide-react';
import { getProfiles } from '../data/profiles';
import { Profile } from '../types/profile';
import MatchOverlay from '../components/MatchOverlay';
import SubscriptionModal from '../components/SubscriptionModal';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';

const DiscoverPage: React.FC = () => {
  const profiles = useMemo(() => getProfiles(), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isActive } = useSubscription();
  const { t } = useLanguage();

  const current = currentIdx < profiles.length ? profiles[currentIdx] : null;

  const y = useMotionValue(0);
  const x = useMotionValue(0);
  
  const rotateZ = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  const swipeUpOpacity = useTransform(y, [0, -100], [0, 1]);
  const scale = useTransform(y, [-200, 0, 200], [0.9, 1, 0.9]);

  const advance = useCallback(() => {
    setCurrentIdx((p) => Math.min(p + 1, profiles.length));
  }, [profiles.length]);

  const saveMatch = useCallback((profile: Profile) => {
    try {
      const stored: number[] = JSON.parse(localStorage.getItem('heartsync_matches') || '[]');
      if (!stored.includes(profile.id)) {
        stored.push(profile.id);
        localStorage.setItem('heartsync_matches', JSON.stringify(stored));
      }
    } catch { /* empty */ }
  }, []);

  const handleLike = useCallback(() => {
    if (!current) return;
    setDirection(1);
    const isMatch = Math.random() < 0.7;
    if (isMatch) {
      saveMatch(current);
      setMatchProfile(current);
      setShowMatch(true);
    } else {
      setTimeout(advance, 250);
    }
  }, [current, advance, saveMatch]);

  const handlePass = useCallback(() => {
    if (!current) return;
    setDirection(-1);
    setTimeout(advance, 250);
  }, [current, advance]);

  const handleSuperLike = useCallback(() => {
    if (!isActive()) {
      setShowSub(true);
      return;
    }
    if (!current) return;
    setDirection(1);
    saveMatch(current);
    setMatchProfile(current);
    setShowMatch(true);
  }, [isActive, current, saveMatch]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 80;
    const swipeThreshold = 120;

    if (info.offset.y < -swipeThreshold) {
      handleSuperLike();
      return;
    }

    if (info.offset.x > threshold) {
      handleLike();
    } else if (info.offset.x < -threshold) {
      handlePass();
    } else if (info.offset.y > threshold) {
      handlePass();
    }
  }, [handleLike, handlePass, handleSuperLike]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleLike();
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePass();
    else if (e.key === 'ArrowUp' || e.key === ' ') handleSuperLike();
  }, [handleLike, handlePass, handleSuperLike]);

  const handleMatchMessage = () => {
    setShowMatch(false);
    advance();
    navigate('/messages');
  };

  const handleMatchKeepSwiping = () => {
    setShowMatch(false);
    advance();
  };

  if (!current) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface-muted px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-heartsync mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">{t('discover.youveSeenEveryone')}</h2>
          <p className="text-gray-500 mb-6">{t('discover.checkBackLater')}</p>
          <button onClick={() => setCurrentIdx(0)} className="btn-primary">
            {t('discover.startOver')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[80vh] bg-surface-muted pb-24 md:pb-8"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={cardRef}
    >
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-black">{t('discover.title')}</h1>
          <p className="text-gray-400 text-xs mt-0.5">{profiles.length - currentIdx} {t('discover.profilesRemaining')}</p>
        </div>

        <div className="relative h-[480px] sm:h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ x: direction * 200, opacity: 0, rotate: direction * 8 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -direction * 200, opacity: 0, rotate: -direction * 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ 
                x, 
                y, 
                rotateZ,
                scale: isDragging ? scale : 1,
                touchAction: 'none'
              }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden h-full select-none">
                <div className="absolute inset-0 pointer-events-none z-10">
                  <motion.div 
                    className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg rotate-[20deg] border-2 border-green-600"
                    style={{ opacity: likeOpacity }}
                  >
                    LIKE
                  </motion.div>
                  <motion.div 
                    className="absolute top-8 left-8 bg-heartsync text-white px-4 py-2 rounded-full font-bold text-lg -rotate-[20deg] border-2 border-red-700"
                    style={{ opacity: passOpacity }}
                  >
                    PASS
                  </motion.div>
                  <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg border-2 border-blue-600"
                    style={{ opacity: swipeUpOpacity }}
                  >
                    SUPER LIKE
                  </motion.div>
                </div>

                <div className="relative h-[70%]">
                  <img
                    src={current.photo}
                    alt={current.name}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="eager"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-black">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      {t('discover.verified')}
                    </span>
                    <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {t('discover.live')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-heartsync" />
                    <span className="text-xs font-bold text-black">{current.matchScore}%</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h2 className="text-2xl font-bold drop-shadow-sm">
                      {current.name}, {current.age}
                    </h2>
                    <div className="flex items-center gap-1.5 text-white/80 text-sm mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{current.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 h-[30%] overflow-y-auto scrollbar-hide">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {current.interests.slice(0, 5).map((tag, j) => (
                      <span key={j} className="px-2.5 py-1 bg-red-50 text-heartsync text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{current.occupation}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{current.bio}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-gray-400 text-xs"
          >
            <ChevronUp className="w-4 h-4 animate-bounce" />
            <span>{t('discover.swipeUpToPass')}</span>
          </motion.div>
        </div>

        <div className="flex justify-center items-center gap-5 mt-4">
          <button
            onClick={handlePass}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-gray-100 active:scale-95"
            aria-label="Pass"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
          <button
            onClick={handleSuperLike}
            className="w-12 h-12 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
            aria-label="Super Like"
          >
            <Star className="w-5 h-5 text-white fill-white" />
          </button>
          <button
            onClick={handleLike}
            className="w-14 h-14 bg-heartsync rounded-full shadow-lg shadow-heartsync/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
            aria-label="Like"
          >
            <Heart className="w-6 h-6 text-white fill-white" />
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          <span className="hidden md:inline">{t('discover.keyboard')}</span>
          <span className="md:hidden">{t('discover.swipeOrTap')}</span>
        </div>
      </div>

      <MatchOverlay
        isOpen={showMatch}
        profile={matchProfile}
        onSendMessage={handleMatchMessage}
        onKeepSwiping={handleMatchKeepSwiping}
      />
      <SubscriptionModal isOpen={showSub} onClose={() => setShowSub(false)} />
    </div>
  );
};

export default DiscoverPage;
