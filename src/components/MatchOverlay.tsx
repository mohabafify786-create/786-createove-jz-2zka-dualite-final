import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X } from 'lucide-react';
import { Profile } from '../types/profile';

interface MatchOverlayProps {
  isOpen: boolean;
  profile: Profile | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

const MatchOverlay: React.FC<MatchOverlayProps> = ({ isOpen, profile, onSendMessage, onKeepSwiping }) => {
  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-center max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-8"
            >
              <Heart className="w-20 h-20 text-heartsync fill-heartsync mx-auto mb-4 drop-shadow-2xl" />
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-extrabold text-white mb-2"
            >
              It&apos;s a Match!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 mb-8 text-lg"
            >
              You and <span className="font-bold text-heartsync-light">{profile.name}</span> liked each other
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-10"
            >
              <div className="relative">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-heartsync shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-heartsync rounded-full flex items-center justify-center ring-4 ring-black/80">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={onSendMessage}
                className="w-full py-4 bg-heartsync text-white font-bold rounded-full text-lg hover:bg-heartsync-dark transition-all shadow-xl shadow-heartsync/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
              </button>
              <button
                onClick={onKeepSwiping}
                className="w-full py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <X className="w-5 h-5" />
                Keep Swiping
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchOverlay;
