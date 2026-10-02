import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Sparkles, ArrowRight, CheckCircle, Star, MapPin, Globe, Award } from 'lucide-react';
import HeartSyncLogo from '../components/HeartSyncLogo';
import { useLanguage } from '../context/LanguageContext';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-white via-surface-muted to-red-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-heartsync/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-heartsync/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-50 text-heartsync px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>{t('landing.aiPowered')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black leading-tight mb-6">
                {t('landing.findYourPerfectMatch')} <span className="text-heartsync">{t('landing.perfect')}</span> {t('landing.match')}
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                {t('landing.landingSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth" className="btn-primary !py-4 !px-8 text-lg inline-flex items-center justify-center gap-2">
                  <span>{t('buttons.startMatching')}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/auth" className="btn-black !py-4 !px-8 text-lg inline-flex items-center justify-center">
                  {t('buttons.viewMatches')}
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8">
                {[
                  t('landing.freeToJoin'),
                  t('landing.verifiedProfiles'),
                  t('landing.secureDating')
                ].map((text) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative hidden lg:block">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-heartsync to-heartsync-light rounded-3xl transform rotate-6 opacity-15" />
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop&crop=faces" alt="HeartSync user" className="w-full h-[500px] object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-heartsync rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Emma, 26</p>
                        <p className="text-gray-300 text-sm">Paris, France</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-medium">96%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, val: '2M+', label: t('landing.activeUsers') },
              { icon: Heart, val: '500K+', label: t('landing.matchesMade') },
              { icon: Globe, val: '50+', label: t('landing.countries') },
              { icon: Award, val: '98%', label: t('landing.successRate') },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-heartsync/20 rounded-xl mb-2">
                  <s.icon className="w-5 h-5 text-heartsync" />
                </div>
                <p className="text-3xl font-bold text-white">{s.val}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-3">{t('landing.whyChoose')} <span className="text-heartsync">{t('landing.heartsync')}</span>?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('landing.whyChooseSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, titleKey: 'landing.smartMatching', descKey: 'landing.smartMatchingDesc' },
              { icon: Shield, titleKey: 'landing.safeSecure', descKey: 'landing.safeSecureDesc' },
              { icon: Users, titleKey: 'landing.realConnections', descKey: 'landing.realConnectionsDesc' },
              { icon: Sparkles, titleKey: 'landing.premiumExperience', descKey: 'landing.premiumExperienceDesc' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group card p-6 hover:shadow-lg transition-all hover:border-heartsync/20">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-heartsync transition-colors">
                  <f.icon className="w-6 h-6 text-heartsync group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-gray-500 text-sm">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('landing.realStories')} <span className="text-heartsync">{t('landing.realLove')}</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('landing.realStoriesSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { names: 'Sarah & Michael', loc: 'New York, NY', img: 'https://i.ibb.co/vx6TB70R/Picsart-26-09-06-19-34-57-585.jpg', quote: 'We matched on HeartSync and knew instantly there was something special!' },
              { names: 'Emily & James', loc: 'Los Angeles, CA', img: 'https://i.ibb.co/840sBXNG/Picsart-26-09-06-19-32-46-342.jpg', quote: 'The smart matching really works! So much in common from the first message.' },
              { names: 'David & Lisa', loc: 'Chicago, IL', img: 'https://i.ibb.co/hFBmp5Kr/Picsart-26-09-06-18-40-12-497.jpg', quote: 'After years of searching, I found my soulmate on HeartSync!' },
            ].map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-gray-800/60 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={testimonial.img} alt={testimonial.names} className="w-12 h-12 rounded-full object-cover ring-2 ring-heartsync" />
                  <div>
                    <h4 className="font-semibold">{testimonial.names}</h4>
                    <div className="flex items-center gap-1 text-gray-400 text-xs"><MapPin className="w-3 h-3" /><span>{testimonial.loc}</span></div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-gray-300 text-sm italic">&quot;{testimonial.quote}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-heartsync">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <HeartSyncLogo size={56} showText={false} className="justify-center mb-6 [&_path:first-child]:fill-white [&_text]:fill-white" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('landing.readyToFindSoulmate')}</h2>
          <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">{t('landing.joinToday')}</p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-heartsync font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-0.5 text-lg">
            <span>{t('landing.getStartedFree')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-3">{t('landing.howItWorks')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', titleKey: 'landing.createProfile', descKey: 'landing.createProfileDesc' },
              { step: '02', titleKey: 'landing.discoverMatches', descKey: 'landing.discoverMatchesDesc' },
              { step: '03', titleKey: 'landing.startDating', descKey: 'landing.startDatingDesc' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative card p-8 text-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-heartsync text-white text-xs font-bold px-3 py-1 rounded-full">{t('landing.step')} {s.step}</span>
                <h3 className="text-lg font-bold text-black mt-3 mb-2">{t(s.titleKey)}</h3>
                <p className="text-gray-500 text-sm">{t(s.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
