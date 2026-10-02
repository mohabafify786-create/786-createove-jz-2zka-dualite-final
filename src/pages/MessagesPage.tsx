import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Heart, ArrowLeft, Check, CheckCheck, Crown, Lock, Clock, CheckCircle } from 'lucide-react';
import { getProfiles } from '../data/profiles';
import { Profile } from '../types/profile';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import { getAIResponse } from '../utils/aiResponder';
import { messageRateLimiter } from '../utils/rateLimiter';
import SubscriptionModal from '../components/SubscriptionModal';

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
  read: boolean;
}

interface StoredConversation {
  id: number;
  profileId: number;
  messages: Message[];
  userMsgCount: number;
  lastActivity: number;
}

interface Conversation {
  id: number;
  profile: Profile;
  messages: Message[];
  userMsgCount: number;
  lastActivity: number;
}

const CONV_KEY = 'heartsync_conversations_v2';
const FREE_MESSAGES = 3;

function loadConversations(profiles: Profile[]): Conversation[] {
  try {
    const stored = localStorage.getItem(CONV_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredConversation[];
      const convs: Conversation[] = [];
      for (const c of parsed) {
        const profile = profiles.find((p) => p.id === c.profileId);
        if (profile) {
          convs.push({
            id: c.id,
            profile,
            messages: c.messages,
            userMsgCount: c.userMsgCount,
            lastActivity: c.lastActivity,
          });
        }
      }
      if (convs.length > 0) return convs;
    }
  } catch { /* empty */ }

  const matchIds: number[] = JSON.parse(localStorage.getItem('heartsync_matches') || '[]');
  const matchedProfiles = matchIds.length > 0
    ? profiles.filter((p) => matchIds.includes(p.id))
    : profiles.slice(0, 8);

  return matchedProfiles.map((profile) => ({
    id: profile.id,
    profile,
    messages: [],
    userMsgCount: 0,
    lastActivity: Date.now() - Math.floor(Math.random() * 86400000),
  }));
}

function serializeConversations(convs: Conversation[]): string {
  const toStore: StoredConversation[] = convs.map((c) => ({
    id: c.id,
    profileId: c.profile.id,
    messages: c.messages,
    userMsgCount: c.userMsgCount,
    lastActivity: c.lastActivity,
  }));
  return JSON.stringify(toStore);
}

const MessagesPage: React.FC = () => {
  const allProfiles = useMemo(() => getProfiles(), []);
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations(allProfiles));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showSub, setShowSub] = useState(false);
  const [typing, setTyping] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  // Ref for the scrollable messages container (not the end marker)
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isActive, canSendMessage, recordMessage, getUserMessageCount } = useSubscription();
  const { t } = useLanguage();
  const subscribed = isActive();

  const selected = conversations.find((c) => c.id === selectedId) || null;

  useEffect(() => {
    try {
      localStorage.setItem(CONV_KEY, serializeConversations(conversations));
    } catch { /* storage full */ }
  }, [conversations]);

  // FIX: Use block: 'nearest' so only the chat container scrolls,
  // not the outer page/window. This prevents the page from jumping
  // downward when a message is sent.
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selected?.messages.length, typing]);

  useEffect(() => {
    const matchIds: number[] = JSON.parse(localStorage.getItem('heartsync_matches') || '[]');
    if (matchIds.length === 0) return;
    setConversations((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newConvs: Conversation[] = [];
      for (const mId of matchIds) {
        if (!existingIds.has(mId)) {
          const profile = allProfiles.find((p) => p.id === mId);
          if (profile) {
            newConvs.push({
              id: profile.id,
              profile,
              messages: [],
              userMsgCount: 0,
              lastActivity: Date.now(),
            });
          }
        }
      }
      return newConvs.length > 0 ? [...newConvs, ...prev] : prev;
    });
  }, [allProfiles]);

  const updateConversation = useCallback((id: number, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = useCallback(() => {
    if (!input.trim() || !selected) return;

    if (!messageRateLimiter.canSend()) {
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), 5000);
      return;
    }

    const convCredits = getUserMessageCount(selected.id);
    if (!subscribed && convCredits >= FREE_MESSAGES) {
      setShowSub(true);
      return;
    }

    if (!canSendMessage(selected.id)) {
      setShowSub(true);
      return;
    }

    messageRateLimiter.record();
    recordMessage(selected.id);

    const userMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      time: now(),
      sent: true,
      read: false,
    };
    const newUserMsgCount = selected.userMsgCount + 1;

    updateConversation(selected.id, (c) => ({
      ...c,
      messages: [...c.messages, userMsg],
      userMsgCount: newUserMsgCount,
      lastActivity: Date.now(),
    }));

    const userText = input.trim();
    setInput('');

    const aiResult = getAIResponse(userText, newUserMsgCount, subscribed);

    if (aiResult.triggerSubscription) {
      setTimeout(() => setShowSub(true), 600);
      return;
    }

    if (aiResult.text) {
      setTyping(true);
      const delay = 1200 + Math.random() * 1200;
      setTimeout(() => {
        setTyping(false);
        const botMsg: Message = {
          id: Date.now() + 1,
          text: aiResult.text,
          time: now(),
          sent: false,
          read: true,
        };
        updateConversation(selected.id, (c) => ({
          ...c,
          messages: [...c.messages, botMsg],
          lastActivity: Date.now(),
        }));
      }, delay);
    }
  }, [input, selected, subscribed, canSendMessage, recordMessage, getUserMessageCount, updateConversation]);

  const filtered = conversations
    .filter((c) => c.profile.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastActivity - a.lastActivity);

  const userCredits = selected ? getUserMessageCount(selected.id) : 0;
  const canType = subscribed || userCredits < FREE_MESSAGES;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-surface-muted overflow-hidden">
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 ${selected ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-lg font-bold text-black mb-3">{t('messages.title')}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('messages.searchConversations')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-9 !py-2.5 !text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{t('messages.noConversations')}</p>
            </div>
          )}
          {filtered.map((conv) => {
            const lastMsg = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
            const hasUnread = lastMsg && !lastMsg.sent && !lastMsg.read;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-3.5 flex items-center gap-3 hover:bg-surface-muted transition-colors border-b border-gray-50 ${
                  selectedId === conv.id ? 'bg-red-50' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.profile.photo}
                    alt={conv.profile.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  {subscribed && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-black text-sm truncate">{conv.profile.name}</h3>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    </div>
                    {lastMsg && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{lastMsg.time}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {lastMsg
                      ? (lastMsg.sent ? 'You: ' : '') + lastMsg.text
                      : t('messages.tapToStart')}
                  </p>
                </div>
                {hasUnread && (
                  <span className="w-2.5 h-2.5 bg-heartsync rounded-full flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${selected ? 'flex' : 'hidden md:flex'}`}>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={`chat-${selected.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="md:hidden p-1.5 hover:bg-surface-muted rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={selected.profile.photo}
                    alt={selected.profile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-semibold text-black text-sm">{selected.profile.name}</h2>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      {subscribed ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-green-600 font-medium">{t('messages.onlineNow')}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400">{t('messages.lastSeen')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!subscribed && (
                  <button
                    onClick={() => setShowSub(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all active:scale-95"
                  >
                    <Crown className="w-3 h-3" />
                    <span>{t('nav.upgrade')}</span>
                  </button>
                )}
              </div>

              {/* FIX: This container is the sole scrollable area for messages.
                  overflow-y-auto ensures scrollIntoView stays within this container.
                  The outer page will NOT scroll because this element handles all scroll internally. */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-muted scrollbar-hide"
                style={{ overscrollBehavior: 'contain' }}
              >
                {selected.messages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-7 h-7 text-heartsync" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{t('messages.sayHi')} {selected.profile.name}!</p>
                    <p className="text-gray-400 text-xs mt-1">{t('messages.sendAMessage')}</p>
                  </div>
                )}
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        msg.sent
                          ? 'bg-heartsync text-white rounded-br-md'
                          : 'bg-white text-black rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sent ? 'text-red-200' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {msg.sent && (msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                {/* End marker: scrollIntoView targets this inside the container only */}
                <div ref={messagesEndRef} />
              </div>

              {!canType && !subscribed && (
                <div className="p-4 bg-gradient-to-r from-heartsync to-heartsync-dark text-white text-center flex-shrink-0">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4" />
                    <span className="font-bold text-sm">{t('messages.freeMessagesExhausted')}</span>
                  </div>
                  <p className="text-xs text-red-100 mb-3">{t('messages.subscribeToContinue')} {selected.profile.name}</p>
                  <button
                    onClick={() => setShowSub(true)}
                    className="px-5 py-2 bg-white text-heartsync font-bold rounded-full text-sm hover:bg-gray-100 transition-colors active:scale-95"
                  >
                    {t('messages.subscribeNow')}
                  </button>
                </div>
              )}

              {rateLimited && (
                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs text-center font-medium flex-shrink-0">
                  {t('messages.slowDown')}
                </div>
              )}

              <div className="p-3.5 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={canType ? t('messages.typeMessage') : t('messages.subscribeToSend')}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={!canType}
                      className="input-field !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!canType || !input.trim()}
                    className="p-2.5 bg-heartsync rounded-full text-white hover:bg-heartsync-dark transition-colors shadow-md shadow-heartsync/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {!subscribed && canType && (
                  <p className="text-center text-[10px] text-gray-400 mt-2">
                    {FREE_MESSAGES - userCredits} {t('messages.freeMessagesRemaining')} {selected.profile.name}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center bg-surface-muted"
            >
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-heartsync" />
                </div>
                <h2 className="text-lg font-bold text-black mb-1">{t('messages.yourMessages')}</h2>
                <p className="text-gray-400 text-sm max-w-xs">{t('messages.selectConversation')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SubscriptionModal isOpen={showSub} onClose={() => setShowSub(false)} />
    </div>
  );
};

export default MessagesPage;
