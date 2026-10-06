import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Heart, MoreVertical, Phone, Video, ArrowLeft, Check, CheckCheck, Crown, Lock, Clock } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionModal from '../components/SubscriptionModal';

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
  read: boolean;
}

interface Conversation {
  id: number;
  name: string;
  image: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const generateConversations = (): Conversation[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: faker.person.firstName(),
    image: `https://images.unsplash.com/photo-${1494790108377 + i * 100000}?w=100&h=100&fit=crop`,
    lastMessage: 'Start chatting to see messages...',
    time: faker.helpers.arrayElement(['2m', '15m', '1h', '3h', 'Yesterday', 'Mon']),
    unread: 0,
    online: false,
    messages: [],
  }));
};

const ChatPage: React.FC = () => {
  const [conversations] = useState<Conversation[]>(generateConversations);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const { checkSubscription, canSendMessage, isUserOnline, getRemainingMessages, decrementMessages } = useSubscription();
  const isSubscribed = checkSubscription();

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAutoResponse = (_userMessage: string): string => {
    const responses = [
      "you look so fresh and hot 🥵 today are you ready for hottie chat 🫦",
      "Mmm I've been thinking about you all day... 💋",
      "You're making me blush! Tell me more about yourself 😏",
      "I love your vibe! What's your idea of a perfect date? 💕",
    ];
    
    if (messageCount === 1) {
      return "you look so fresh and hot 🥵 today are you ready for hottie chat 🫦";
    }
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    if (!canSendMessage()) {
      setShowSubscriptionModal(true);
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      read: false,
    };

    selectedChat.messages = [...selectedChat.messages, newMessage];
    setMessage('');
    setMessageCount((prev) => prev + 1);
    decrementMessages();

    if (messageCount >= 1 && !isSubscribed) {
      setTimeout(() => setShowSubscriptionModal(true), 1000);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoResponse: Message = {
        id: Date.now() + 1,
        text: getAutoResponse(message),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: false,
        read: true,
      };
      if (selectedChat) {
        selectedChat.messages = [...selectedChat.messages, autoResponse];
      }
    }, 1500);
  };

  useEffect(() => {
    if (selectedChat) {
      const initialMessage: Message = {
        id: 0,
        text: "Hi babe how you doing 😘",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: false,
        read: true,
      };
      if (selectedChat.messages.length === 0) {
        selectedChat.messages = [initialMessage];
      }
    }
  }, [selectedChat]);

  return (
    <div className="min-h-[80vh] bg-gray-50 flex">
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 ${selectedChat ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-black mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(80vh-140px)]">
          {filteredConversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              onClick={() => setSelectedChat(conversation)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                selectedChat?.id === conversation.id ? 'bg-red-50' : ''
              }`}
              whileHover={{ x: 4 }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conversation.image}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {isUserOnline(conversation.id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-black truncate">{conversation.name}</h3>
                  <span className="text-xs text-gray-400">{conversation.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {!isSubscribed && (
                    <Lock className="w-3 h-3 text-gray-400" />
                  )}
                  <p className="text-sm text-gray-500 truncate">
                    {isSubscribed ? conversation.lastMessage : 'Subscribe to chat...'}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${selectedChat ? 'block' : 'hidden md:flex'}`}>
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={selectedChat.image}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-semibold text-black">{selectedChat.name}</h2>
                    <div className="flex items-center gap-1">
                      {isSubscribed ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-500">Online now</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Last seen recently</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isSubscribed && (
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-semibold rounded-full"
                    >
                      <Crown className="w-3 h-3" />
                      Upgrade
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        msg.sent
                          ? 'bg-red-500 text-white rounded-br-md'
                          : 'bg-white text-black rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${msg.sent ? 'text-red-100' : 'text-gray-400'}`}>
                        <span className="text-xs">{msg.time}</span>
                        {msg.sent && (
                          msg.read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-black rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isSubscribed && getRemainingMessages() <= 0 && (
                <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-semibold">Free messages exhausted!</span>
                  </div>
                  <p className="text-sm text-red-100 mb-3">Subscribe to continue chatting and see who's online</p>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-6 py-2 bg-white text-red-500 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}

              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={isSubscribed ? "Type a message..." : "Subscribe to send messages..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={!isSubscribed && getRemainingMessages() <= 0}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!isSubscribed && getRemainingMessages() <= 0}
                    className="p-2.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center bg-gray-50"
            >
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-black mb-2">Your Messages</h2>
                <p className="text-gray-500 max-w-xs">
                  Select a conversation to start chatting with your matches
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};

export default ChatPage;
