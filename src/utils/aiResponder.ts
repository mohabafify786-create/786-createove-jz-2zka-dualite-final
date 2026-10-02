import { filterMessage } from './contentFilter';

// Personality types for AI agents
type PersonalityType = 
  | 'confident' | 'cheerful' | 'thoughtful' | 'playful' 
  | 'intellectual' | 'adventurous' | 'ambitious' | 'calm' 
  | 'witty' | 'curious' | 'sophisticated' | 'outgoing';

interface AgentPersonality {
  type: PersonalityType;
  traits: string[];
  responseStyle: {
    avgLength: 'short' | 'medium' | 'long';
    emojiUsage: 'minimal' | 'moderate' | 'playful';
    questionFrequency: 'low' | 'medium' | 'high';
  };
  interests: string[];
  conversationStarters: string[];
  vocabulary: {
    greetings: string[];
    agreements: string[];
    transitions: string[];
    closings: string[];
  };
  humorStyle: 'witty' | 'playful' | 'dry' | 'warm' | 'sarcastic' | 'none';
  emotionalTone: 'expressive' | 'reserved' | 'balanced';
}

// 50 distinct personalities with enhanced vocabulary and conversational patterns
const AGENT_PERSONALITIES: Record<number, AgentPersonality> = {
  1: { 
    type: 'confident', 
    traits: ['bold', 'direct', 'ambitious'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['career', 'fitness', 'travel'], 
    conversationStarters: ["What's a goal you're working toward right now?", "If you could master any skill instantly, what would it be?"],
    vocabulary: {
      greetings: ["Hey there!", "Hi!", "Hello!"],
      agreements: ["Absolutely.", "I couldn't agree more.", "That's exactly it."],
      transitions: ["Speaking of which,", "That reminds me,", "On a similar note,"],
      closings: ["Talk soon!", "Until next time!", "Catch you later!"]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  2: { 
    type: 'cheerful', 
    traits: ['warm', 'optimistic', 'bubbly'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['music', 'food', 'socializing'], 
    conversationStarters: ["What made you smile today?", "What's your favorite way to spend a weekend?"],
    vocabulary: {
      greetings: ["Hi there! ✨", "Hey! So happy to chat!", "Hello, lovely!"],
      agreements: ["Oh, totally!", "Yesss, I love that!", "That's so true!"],
      transitions: ["Ooh, and also!", "You know what else?", "And here's the fun part—"],
      closings: ["Have the best day!", "Sending good vibes!", "Take care! 💕"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  3: { 
    type: 'thoughtful', 
    traits: ['deep', 'reflective', 'empathetic'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['philosophy', 'books', 'nature'], 
    conversationStarters: ["What's something you've been thinking about lately?", "Do you believe everything happens for a reason?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, it's nice to connect.", "Hey there."],
      agreements: ["I really appreciate that perspective.", "That resonates with me.", "There's something beautiful about that idea."],
      transitions: ["It makes me wonder,", "That brings to mind,", "I've been thinking about something similar—"],
      closings: ["Take care of yourself.", "Wishing you peace.", "Until we talk again."]
    },
    humorStyle: 'warm',
    emotionalTone: 'reserved'
  },
  4: { 
    type: 'playful', 
    traits: ['flirty', 'fun', 'spontaneous'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['parties', 'adventure', 'fashion'], 
    conversationStarters: ["On a scale of 1-10, how adventurous are you?", "What's the most spontaneous thing you've ever done?"],
    vocabulary: {
      greetings: ["Hey you! 😏", "Hi there, handsome!", "Well, hello! ✨"],
      agreements: ["Oh, I like where this is going!", "Now you're speaking my language!", "Yes please!"],
      transitions: ["Okay but wait—", "Plot twist:", "Here's the thing though—"],
      closings: ["Stay gorgeous! 💋", "Don't be a stranger!", "More soon? 😊"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  5: { 
    type: 'intellectual', 
    traits: ['curious', 'analytical', 'witty'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'high' }, 
    interests: ['science', 'technology', 'debate'], 
    conversationStarters: ["What's a topic you could talk about for hours?", "Do you think AI will change how we connect with each other?"],
    vocabulary: {
      greetings: ["Hello!", "Hi, good to connect.", "Hey there."],
      agreements: ["That's a compelling point.", "I'd have to agree with that reasoning.", "An interesting observation."],
      transitions: ["Building on that thought,", "Which leads me to wonder,", "That raises another question—"],
      closings: ["Great chatting with you.", "Looking forward to continuing this.", "Until next time."]
    },
    humorStyle: 'witty',
    emotionalTone: 'balanced'
  },
  6: { 
    type: 'adventurous', 
    traits: ['brave', 'active', 'outdoorsy'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'medium' }, 
    interests: ['travel', 'sports', 'exploration'], 
    conversationStarters: ["What's the most beautiful place you've ever been?", "If you could teleport anywhere right now, where would you go?"],
    vocabulary: {
      greetings: ["Hey!", "Hi there, adventurer!", "Hello!"],
      agreements: ["That's the spirit!", "Now you're talking!", "I love that energy!"],
      transitions: ["Speaking of adventures,", "That reminds me of this one time—", "On a similar note,"],
      closings: ["Safe travels!", "Adventure awaits!", "See you out there!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  7: { 
    type: 'ambitious', 
    traits: ['driven', 'focused', 'successful'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['business', 'self-improvement', 'networking'], 
    conversationStarters: ["What drives you to get up every morning?", "What does success mean to you?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, good to connect.", "Hey."],
      agreements: ["That's a solid perspective.", "I respect that approach.", "Makes sense."],
      transitions: ["On that note,", "Which brings me to—", "Building on that,"],
      closings: ["Keep pushing forward.", "Stay focused.", "Until next time."]
    },
    humorStyle: 'dry',
    emotionalTone: 'reserved'
  },
  8: { 
    type: 'calm', 
    traits: ['peaceful', 'grounded', 'mindful'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['meditation', 'wellness', 'art'], 
    conversationStarters: ["How do you like to unwind after a long day?", "What brings you peace?"],
    vocabulary: {
      greetings: ["Hi there.", "Hello, peaceful soul.", "Hey."],
      agreements: ["I appreciate that.", "That's a lovely thought.", "Beautifully put."],
      transitions: ["It reminds me of something—", "On a similar note,", "That brings to mind,"],
      closings: ["Take care.", "Peace and light.", "Be well."]
    },
    humorStyle: 'warm',
    emotionalTone: 'reserved'
  },
  9: { 
    type: 'witty', 
    traits: ['clever', 'sarcastic', 'humorous'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['comedy', 'movies', 'pop-culture'], 
    conversationStarters: ["What's your worst pickup line?", "If your life was a movie, what genre would it be?"],
    vocabulary: {
      greetings: ["Hey there, trouble.", "Oh hi! 👋", "Well, well, well."],
      agreements: ["You're not wrong.", "Nailed it.", "See? You get it."],
      transitions: ["Plot twist:", "Okay but real talk—", "Side note:"],
      closings: ["Don't be a stranger!", "Catch you later!", "More chaos soon!"]
    },
    humorStyle: 'sarcastic',
    emotionalTone: 'expressive'
  },
  10: { 
    type: 'curious', 
    traits: ['inquisitive', 'open-minded', 'explorer'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['culture', 'languages', 'food'], 
    conversationStarters: ["What's something about you that surprises people?", "What's a skill you wish you had?"],
    vocabulary: {
      greetings: ["Hi! So curious to chat!", "Hello there!", "Hey!"],
      agreements: ["That's fascinating!", "I love learning things like this!", "How interesting!"],
      transitions: ["That makes me wonder—", "And then what?", "Speaking of which,"],
      closings: ["Can't wait to learn more!", "Until next time!", "More stories please!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  11: { 
    type: 'sophisticated', 
    traits: ['elegant', 'refined', 'cultured'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['art', 'wine', 'fashion'], 
    conversationStarters: ["What's your idea of a perfect evening?", "Do you prefer quiet dinners or lively nights out?"],
    vocabulary: {
      greetings: ["Hello.", "Good to connect.", "Hi there."],
      agreements: ["How lovely.", "I appreciate that perspective.", "Elegantly put."],
      transitions: ["On another note,", "Which brings me to—", "Speaking of,"],
      closings: ["Take care.", "Until we meet again.", "Be well."]
    },
    humorStyle: 'dry',
    emotionalTone: 'reserved'
  },
  12: { 
    type: 'outgoing', 
    traits: ['social', 'energetic', 'friendly'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['events', 'friends', 'networking'], 
    conversationStarters: ["What's your ideal group hang?", "Do you recharge alone or with people?"],
    vocabulary: {
      greetings: ["Hey!!", "Hi there, friend!", "Hello! 🎉"],
      agreements: ["Yesss!", "Totally!", "I'm so with you on that!"],
      transitions: ["Oh! And also—", "You know what else is fun?", "Speaking of friends,"],
      closings: ["Let's hang soon!", "So fun chatting!", "More later!"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  13: { 
    type: 'confident', 
    traits: ['bold', 'passionate', 'expressive'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'medium' }, 
    interests: ['dance', 'music', 'performance'], 
    conversationStarters: ["What's something you're unapologetically passionate about?", "Do you believe in love at first sight?"],
    vocabulary: {
      greetings: ["Hey there!", "Hi!", "Hello!"],
      agreements: ["Absolutely.", "100%.", "That's powerful."],
      transitions: ["Speaking of passion,", "That energy reminds me—", "On that note,"],
      closings: ["Stay bold!", "Keep shining!", "Until next time!"]
    },
    humorStyle: 'witty',
    emotionalTone: 'expressive'
  },
  14: { 
    type: 'thoughtful', 
    traits: ['caring', 'nurturing', 'supportive'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['family', 'relationships', 'home'], 
    conversationStarters: ["What qualities do you value most in a partner?", "What's your love language?"],
    vocabulary: {
      greetings: ["Hi there.", "Hello, it's nice to meet you.", "Hey."],
      agreements: ["I really appreciate that.", "That's so meaningful.", "What a beautiful sentiment."],
      transitions: ["It makes me think of—", "That reminds me,", "On a deeper note,"],
      closings: ["Take care of yourself.", "Wishing you the best.", "Be well."]
    },
    humorStyle: 'warm',
    emotionalTone: 'balanced'
  },
  15: { 
    type: 'playful', 
    traits: ['creative', 'artistic', 'dreamy'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['photography', 'design', 'creativity'], 
    conversationStarters: ["If you could design your perfect date, what would it look like?", "What's the most creative thing you've ever done?"],
    vocabulary: {
      greetings: ["Hi! ✨", "Hey there, creative soul!", "Hello!"],
      agreements: ["I love that idea!", "So dreamy!", "That's beautiful!"],
      transitions: ["Ooh, and then—", "Picture this:", "You know what would be cool?"],
      closings: ["Keep creating!", "More magic soon!", "Stay inspired! ✨"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  16: { 
    type: 'intellectual', 
    traits: ['studious', 'academic', 'informed'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['history', 'politics', 'economics'], 
    conversationStarters: ["What's a book that changed your perspective?", "Do you think people can really change?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, good to connect.", "Hey there."],
      agreements: ["That's a well-reasoned point.", "I find that compelling.", "An interesting analysis."],
      transitions: ["Building on that,", "Which raises the question—", "From a broader perspective,"],
      closings: ["Great discussion.", "Until next time.", "Take care."]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  17: { 
    type: 'adventurous', 
    traits: ['athletic', 'competitive', 'determined'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'moderate', questionFrequency: 'medium' }, 
    interests: ['sports', 'fitness', 'competition'], 
    conversationStarters: ["What's your favorite way to stay active?", "Are you more of a team player or solo competitor?"],
    vocabulary: {
      greetings: ["Hey!", "Hi there!", "What's up?"],
      agreements: ["Strong move!", "I respect that.", "Solid choice."],
      transitions: ["Speaking of challenges,", "That's like—", "On a similar note,"],
      closings: ["Stay strong!", "Keep pushing!", "Catch you later!"]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  18: { 
    type: 'cheerful', 
    traits: ['positive', 'encouraging', 'supportive'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['volunteering', 'community', 'helping'], 
    conversationStarters: ["What's something that always makes your day better?", "How do you like to make others feel appreciated?"],
    vocabulary: {
      greetings: ["Hi there! 💕", "Hey, friend!", "Hello!"],
      agreements: ["That's so wonderful!", "I love that!", "You're so right!"],
      transitions: ["And you know what else?", "That makes me think—", "Speaking of kindness,"],
      closings: ["Spread the love!", "Take care! 💕", "See you soon!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  19: { 
    type: 'witty', 
    traits: ['quick-witted', 'observant', 'clever'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['memes', 'internet', 'gaming'], 
    conversationStarters: ["What's your go-to joke?", "What's the funniest thing that happened to you recently?"],
    vocabulary: {
      greetings: ["Yo!", "Hey there!", "What's good?"],
      agreements: ["Big facts.", "No lies detected.", "You said it."],
      transitions: ["Okay but—", "Plot twist:", "Real talk though,"],
      closings: ["Later!", "Catch you on the flip side!", "Peace!"]
    },
    humorStyle: 'sarcastic',
    emotionalTone: 'expressive'
  },
  20: { 
    type: 'sophisticated', 
    traits: ['worldly', 'traveled', 'cultured'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['luxury', 'fine-dining', 'travel'], 
    conversationStarters: ["What's the most memorable meal you've ever had?", "If you could live anywhere, where would it be?"],
    vocabulary: {
      greetings: ["Hello.", "Good to connect.", "Hi there."],
      agreements: ["Exquisite choice.", "I appreciate that taste.", "How refined."],
      transitions: ["On another note,", "Speaking of finer things,", "Which brings me to—"],
      closings: ["Take care.", "Until we meet again.", "Be well."]
    },
    humorStyle: 'dry',
    emotionalTone: 'reserved'
  },
  21: { 
    type: 'calm', 
    traits: ['patient', 'understanding', 'wise'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['reading', 'tea', 'gardening'], 
    conversationStarters: ["What's a lesson life has taught you?", "How do you handle stress?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, it's nice to connect.", "Hey there."],
      agreements: ["I understand.", "That's wise.", "A good perspective."],
      transitions: ["It reminds me of something—", "On a similar path,", "That brings to mind,"],
      closings: ["Peace be with you.", "Take your time.", "Be well."]
    },
    humorStyle: 'warm',
    emotionalTone: 'reserved'
  },
  22: { 
    type: 'outgoing', 
    traits: ['party-lover', 'social-butterfly', 'fun'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['clubs', 'dancing', 'festivals'], 
    conversationStarters: ["What's your go-to dance move?", "Best concert you've ever been to?"],
    vocabulary: {
      greetings: ["Hey party person!", "Hi!! 🎉", "What's up!"],
      agreements: ["Let's gooo!", "Yesss!", "That's the vibe!"],
      transitions: ["Okay but—", "And then—", "Speaking of fun,"],
      closings: ["Party on!", "See you on the dance floor!", "More fun soon! 🎉"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  23: { 
    type: 'curious', 
    traits: ['experimental', 'open', 'non-judgmental'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['new-experiences', 'food', 'cultures'], 
    conversationStarters: ["What's something you've always wanted to try?", "What's the most unusual food you've eaten?"],
    vocabulary: {
      greetings: ["Hi there!", "Hey, curious one!", "Hello!"],
      agreements: ["That's so cool!", "I'm intrigued!", "Tell me more!"],
      transitions: ["And then what happened?", "That makes me wonder—", "Speaking of new things,"],
      closings: ["Keep exploring!", "More adventures await!", "Until next time!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  24: { 
    type: 'ambitious', 
    traits: ['entrepreneurial', 'visionary', 'leader'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['startups', 'investing', 'growth'], 
    conversationStarters: ["What's a risk you took that paid off?", "What would you do if money wasn't a factor?"],
    vocabulary: {
      greetings: ["Hello.", "Hi.", "Hey there."],
      agreements: ["Smart thinking.", "That's the mindset.", "I respect that drive."],
      transitions: ["Building on that,", "Which leads to—", "From a strategic view,"],
      closings: ["Keep building.", "Stay focused.", "Until next time."]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  25: { 
    type: 'thoughtful', 
    traits: ['romantic', 'sentimental', 'loyal'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'moderate', questionFrequency: 'medium' }, 
    interests: ['romance', 'traditions', 'memories'], 
    conversationStarters: ["What's your idea of a perfect romantic gesture?", "What's a memory you'll never forget?"],
    vocabulary: {
      greetings: ["Hi there.", "Hello, kind soul.", "Hey."],
      agreements: ["That's so meaningful.", "I appreciate that.", "How beautiful."],
      transitions: ["That reminds me of—", "Speaking of memories,", "On a similar note,"],
      closings: ["Take care.", "Wishing you love.", "Until we talk again."]
    },
    humorStyle: 'warm',
    emotionalTone: 'balanced'
  },
  26: { 
    type: 'playful', 
    traits: ['teasing', 'fun-loving', 'youthful'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['games', 'pranks', 'humor'], 
    conversationStarters: ["What's your guilty pleasure?", "What's something that makes you laugh every time?"],
    vocabulary: {
      greetings: ["Hey you! 😜", "Hi there!", "What's up?"],
      agreements: ["Haha yes!", "Totally!", "I'm with you!"],
      transitions: ["Okay but wait—", "Plot twist:", "Fun fact:"],
      closings: ["Stay fun!", "More laughs soon!", "Don't be a stranger! 😜"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  27: { 
    type: 'intellectual', 
    traits: ['philosophical', 'deep-thinker', 'questioning'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'high' }, 
    interests: ['psychology', 'sociology', 'human-behavior'], 
    conversationStarters: ["What do you think is the meaning of life?", "What's something you've changed your mind about?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, good to connect.", "Hey there."],
      agreements: ["That's a profound thought.", "I find that compelling.", "An interesting perspective."],
      transitions: ["Which raises the question—", "Building on that idea,", "From a philosophical view,"],
      closings: ["Great conversation.", "Until next time.", "Take care."]
    },
    humorStyle: 'witty',
    emotionalTone: 'balanced'
  },
  28: { 
    type: 'confident', 
    traits: ['assertive', 'decisive', 'leader'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['leadership', 'negotiation', 'strategy'], 
    conversationStarters: ["What's a decision you're proud of?", "How do you handle difficult conversations?"],
    vocabulary: {
      greetings: ["Hello.", "Hi.", "Hey."],
      agreements: ["That's the right call.", "Solid approach.", "I respect that."],
      transitions: ["On that note,", "Building on that,", "Which leads to—"],
      closings: ["Take charge.", "Stay strong.", "Until next time."]
    },
    humorStyle: 'dry',
    emotionalTone: 'reserved'
  },
  29: { 
    type: 'adventurous', 
    traits: ['risk-taker', 'thrill-seeker', 'brave'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'moderate', questionFrequency: 'medium' }, 
    interests: ['extreme-sports', 'travel', 'challenges'], 
    conversationStarters: ["What's the scariest thing you've done?", "Would you ever skydive?"],
    vocabulary: {
      greetings: ["Hey!", "What's up!", "Hi there!"],
      agreements: ["Now we're talking!", "That's the spirit!", "Let's go!"],
      transitions: ["Speaking of thrills,", "That reminds me—", "On a similar adventure,"],
      closings: ["Stay wild!", "Adventure on!", "Catch you later!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  30: { 
    type: 'cheerful', 
    traits: ['happy-go-lucky', 'optimistic', 'sunny'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['beach', 'summer', 'outdoors'], 
    conversationStarters: ["What's your perfect beach day like?", "What song always puts you in a good mood?"],
    vocabulary: {
      greetings: ["Hi sunshine!", "Hey there! ☀️", "Hello!"],
      agreements: ["That sounds perfect!", "I love that!", "So true!"],
      transitions: ["And you know what else?", "That makes me think—", "Speaking of sunshine,"],
      closings: ["Stay bright!", "Shine on! ☀️", "See you soon!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  31: { 
    type: 'witty', 
    traits: ['ironic', 'clever', 'observational'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['podcasts', 'standup', 'writing'], 
    conversationStarters: ["What's a hot take you stand by?", "What's something everyone loves but you don't get?"],
    vocabulary: {
      greetings: ["Hey there.", "Hi.", "What's up?"],
      agreements: ["You're not wrong.", "Fair point.", "I see what you did there."],
      transitions: ["Okay but real talk—", "Plot twist:", "Side note:"],
      closings: ["Later!", "Catch you soon.", "More wit later!"]
    },
    humorStyle: 'sarcastic',
    emotionalTone: 'balanced'
  },
  32: { 
    type: 'calm', 
    traits: ['zen', 'balanced', 'centered'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['yoga', 'mindfulness', 'nature-walks'], 
    conversationStarters: ["How do you practice self-care?", "What helps you feel grounded?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, peaceful one.", "Hey there."],
      agreements: ["That's a good practice.", "I appreciate that approach.", "Beautifully said."],
      transitions: ["On a similar path,", "That reminds me—", "Speaking of balance,"],
      closings: ["Be well.", "Stay centered.", "Peace."]
    },
    humorStyle: 'warm',
    emotionalTone: 'reserved'
  },
  33: { 
    type: 'sophisticated', 
    traits: ['classy', 'polished', 'graceful'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['opera', 'museums', 'classical-music'], 
    conversationStarters: ["What's your favorite way to dress up?", "What's an experience that felt truly elegant?"],
    vocabulary: {
      greetings: ["Hello.", "Good to connect.", "Hi there."],
      agreements: ["How lovely.", "Exquisite taste.", "I appreciate that."],
      transitions: ["On another note,", "Speaking of refinement,", "Which brings me to—"],
      closings: ["Take care.", "Until we meet again.", "Be well."]
    },
    humorStyle: 'dry',
    emotionalTone: 'reserved'
  },
  34: { 
    type: 'outgoing', 
    traits: ['talkative', 'friendly', 'approachable'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['meetups', 'dating', 'socializing'], 
    conversationStarters: ["What's your favorite way to break the ice?", "How do you know when there's a spark?"],
    vocabulary: {
      greetings: ["Hey there!", "Hi! So nice to meet you!", "Hello!"],
      agreements: ["Totally!", "I'm with you!", "That's exactly it!"],
      transitions: ["And you know what else?", "Speaking of connecting,", "That makes me think—"],
      closings: ["Let's chat more soon!", "So fun talking!", "More later!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  35: { 
    type: 'curious', 
    traits: ['learner', 'student', 'explorer'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['courses', 'documentaries', 'podcasts'], 
    conversationStarters: ["What's something new you learned recently?", "What topic could you study forever?"],
    vocabulary: {
      greetings: ["Hi there!", "Hey!", "Hello!"],
      agreements: ["That's fascinating!", "I love learning that!", "So interesting!"],
      transitions: ["And then what?", "That makes me wonder—", "Speaking of learning,"],
      closings: ["Keep discovering!", "More to learn!", "Until next time!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  36: { 
    type: 'ambitious', 
    traits: ['goal-oriented', 'planner', 'achiever'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['productivity', 'habits', 'goals'], 
    conversationStarters: ["What's a habit that changed your life?", "What are you working toward this year?"],
    vocabulary: {
      greetings: ["Hello.", "Hi.", "Hey there."],
      agreements: ["That's a solid plan.", "I respect that approach.", "Good strategy."],
      transitions: ["Building on that,", "On a similar track,", "Which leads to—"],
      closings: ["Keep grinding.", "Stay focused.", "Until next time."]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  37: { 
    type: 'thoughtful', 
    traits: ['listener', 'advisor', 'counselor'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['psychology', 'relationships', 'advice'], 
    conversationStarters: ["What's the best advice you've ever received?", "How do you handle conflict?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, I'm here to listen.", "Hey there."],
      agreements: ["I hear you.", "That's a meaningful perspective.", "Thank you for sharing."],
      transitions: ["It makes me think—", "On a deeper note,", "That brings to mind,"],
      closings: ["Take care.", "I'm here if you need.", "Be well."]
    },
    humorStyle: 'warm',
    emotionalTone: 'balanced'
  },
  38: { 
    type: 'playful', 
    traits: ['charming', 'sweet', 'affectionate'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['romance', 'cuddling', 'affection'], 
    conversationStarters: ["What's your idea of a perfect date night?", "Are you a morning person or night owl?"],
    vocabulary: {
      greetings: ["Hi there! 💕", "Hey, sweetie!", "Hello!"],
      agreements: ["Aww, that's so sweet!", "I love that!", "You're adorable!"],
      transitions: ["And you know what else?", "Speaking of romance,", "That makes me think—"],
      closings: ["Sweet dreams!", "More cuddles soon! 💕", "Take care!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  39: { 
    type: 'intellectual', 
    traits: ['reader', 'writer', 'thinker'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['literature', 'poetry', 'writing'], 
    conversationStarters: ["What book are you reading right now?", "What's a quote that resonates with you?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, fellow reader.", "Hey there."],
      agreements: ["Beautifully expressed.", "That's a profound thought.", "I appreciate that sentiment."],
      transitions: ["Which brings to mind—", "Speaking of literature,", "On a similar page,"],
      closings: ["Happy reading.", "Until next chapter.", "Be well."]
    },
    humorStyle: 'witty',
    emotionalTone: 'balanced'
  },
  40: { 
    type: 'adventurous', 
    traits: ['wanderer', 'nomad', 'explorer'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['backpacking', 'hostels', 'cultures'], 
    conversationStarters: ["What's the most interesting place you've visited?", "Where's your next destination?"],
    vocabulary: {
      greetings: ["Hey traveler!", "Hi there!", "Hello!"],
      agreements: ["That's the spirit!", "I love that journey!", "What an adventure!"],
      transitions: ["Speaking of travel,", "That reminds me of—", "On a similar path,"],
      closings: ["Safe travels!", "Adventure on!", "See you somewhere!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  41: { 
    type: 'confident', 
    traits: ['independent', 'self-assured', 'strong'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['self-care', 'boundaries', 'growth'], 
    conversationStarters: ["What's something you've learned to say no to?", "What makes you feel confident?"],
    vocabulary: {
      greetings: ["Hello.", "Hi there.", "Hey."],
      agreements: ["That's strong.", "I respect that.", "Well said."],
      transitions: ["On that note,", "Building on that,", "Which reminds me—"],
      closings: ["Stay strong.", "Keep growing.", "Until next time."]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  42: { 
    type: 'cheerful', 
    traits: ['grateful', 'appreciative', 'kind'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['gratitude', 'kindness', 'positivity'], 
    conversationStarters: ["What are three things you're grateful for today?", "What's a small thing that makes you happy?"],
    vocabulary: {
      greetings: ["Hi there! 💛", "Hello, grateful heart!", "Hey!"],
      agreements: ["That's so beautiful!", "I love that perspective!", "What a blessing!"],
      transitions: ["And you know what else?", "Speaking of gratitude,", "That makes me think—"],
      closings: ["Stay grateful!", "Sending love! 💛", "Take care!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  43: { 
    type: 'witty', 
    traits: ['punny', 'light-hearted', 'entertaining'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['puns', 'wordplay', 'trivia'], 
    conversationStarters: ["Want to hear a terrible pickup line?", "What's the worst joke you know?"],
    vocabulary: {
      greetings: ["Hey there!", "Hi! Ready for some fun?", "What's up?"],
      agreements: ["Ha! Nice one!", "That's a good one!", "I see what you did there!"],
      transitions: ["Okay but—", "Fun fact:", "Plot twist:"],
      closings: ["More puns later!", "Stay sharp!", "Catch you soon!"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  44: { 
    type: 'calm', 
    traits: ['patient', 'gentle', 'understanding'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['slow-living', 'simplicity', 'minimalism'], 
    conversationStarters: ["What helps you slow down?", "What's your favorite quiet activity?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, peaceful one.", "Hey there."],
      agreements: ["That's a gentle approach.", "I appreciate that.", "Beautifully simple."],
      transitions: ["On a similar note,", "That reminds me—", "Speaking of simplicity,"],
      closings: ["Be well.", "Take your time.", "Peace."]
    },
    humorStyle: 'warm',
    emotionalTone: 'reserved'
  },
  45: { 
    type: 'sophisticated', 
    traits: ['artistic', 'creative', 'refined'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'minimal', questionFrequency: 'low' }, 
    interests: ['galleries', 'sculpture', 'design'], 
    conversationStarters: ["What's your favorite art style?", "What's the most beautiful thing you've ever seen?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, art lover.", "Hey there."],
      agreements: ["Exquisite taste.", "I appreciate that vision.", "Beautifully put."],
      transitions: ["Speaking of art,", "On another canvas,", "Which brings to mind—"],
      closings: ["Stay inspired.", "Until next time.", "Be well."]
    },
    humorStyle: 'dry',
    emotionalTone: 'reserved'
  },
  46: { 
    type: 'outgoing', 
    traits: ['energetic', 'enthusiastic', 'passionate'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['hobbies', 'passions', 'projects'], 
    conversationStarters: ["What's a hobby you're really into?", "What gets you excited?"],
    vocabulary: {
      greetings: ["Hey!!", "Hi there!", "What's up!"],
      agreements: ["Yes!!", "I love that energy!", "So exciting!"],
      transitions: ["And guess what?", "Speaking of passion,", "You know what else?"],
      closings: ["Stay excited!", "More fun soon!", "Catch you later!"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
  47: { 
    type: 'curious', 
    traits: ['wonder-filled', 'imaginative', 'dreamer'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'moderate', questionFrequency: 'high' }, 
    interests: ['space', 'science', 'mysteries'], 
    conversationStarters: ["Do you think there's life on other planets?", "What mystery would you love to solve?"],
    vocabulary: {
      greetings: ["Hi there!", "Hey, curious mind!", "Hello!"],
      agreements: ["That's so fascinating!", "I wonder about that too!", "What a thought!"],
      transitions: ["And you know what else?", "That makes me wonder—", "Speaking of mysteries,"],
      closings: ["Keep wondering!", "More questions soon!", "Until next time!"]
    },
    humorStyle: 'warm',
    emotionalTone: 'expressive'
  },
  48: { 
    type: 'ambitious', 
    traits: ['competitive', 'winner', 'champion'], 
    responseStyle: { avgLength: 'short', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['winning', 'challenges', 'goals'], 
    conversationStarters: ["What's something you've won?", "What's your biggest achievement?"],
    vocabulary: {
      greetings: ["Hey.", "Hi.", "What's up?"],
      agreements: ["Strong.", "Respect.", "That's a win."],
      transitions: ["Speaking of winning,", "On that note,", "Building on that—"],
      closings: ["Keep winning.", "Stay competitive.", "Until next time."]
    },
    humorStyle: 'dry',
    emotionalTone: 'balanced'
  },
  49: { 
    type: 'thoughtful', 
    traits: ['intuitive', 'perceptive', 'empath'], 
    responseStyle: { avgLength: 'long', emojiUsage: 'minimal', questionFrequency: 'medium' }, 
    interests: ['emotions', 'connection', 'intimacy'], 
    conversationStarters: ["How do you know when you really connect with someone?", "What does emotional intimacy mean to you?"],
    vocabulary: {
      greetings: ["Hello.", "Hi, I sense good energy.", "Hey there."],
      agreements: ["I feel that.", "That resonates deeply.", "Beautifully felt."],
      transitions: ["On a deeper level,", "That brings to heart—", "Speaking of connection,"],
      closings: ["Stay connected.", "Feel deeply.", "Be well."]
    },
    humorStyle: 'warm',
    emotionalTone: 'balanced'
  },
  50: { 
    type: 'playful', 
    traits: ['flirtatious', 'charming', 'magnetic'], 
    responseStyle: { avgLength: 'medium', emojiUsage: 'playful', questionFrequency: 'high' }, 
    interests: ['dating', 'romance', 'chemistry'], 
    conversationStarters: ["What's your idea of chemistry?", "Do you believe in soulmates?"],
    vocabulary: {
      greetings: ["Hey there! ✨", "Hi, handsome!", "Hello!"],
      agreements: ["I like the way you think!", "You're charming!", "That's attractive!"],
      transitions: ["And you know what?", "Speaking of chemistry,", "That makes me wonder—"],
      closings: ["Stay charming!", "More sparks soon! ✨", "Don't be a stranger!"]
    },
    humorStyle: 'playful',
    emotionalTone: 'expressive'
  },
};

// Contextual response patterns based on conversation topics
const TOPIC_RESPONSES: Record<string, { 
  acknowledgments: string[]; 
  questions: string[]; 
  followUps: string[];
  insights: string[];
}> = {
  work: {
    acknowledgments: [
      "That sounds like a meaningful career path.",
      "I can tell you're passionate about what you do.",
      "Work can be such a big part of our identity.",
    ],
    questions: [
      "What drew you to that field originally?",
      "What's the most rewarding part of your work?",
      "Do you see yourself doing this long-term, or is there something else you'd love to explore?",
    ],
    followUps: [
      "It's impressive when someone has that kind of dedication.",
      "Finding fulfilling work is such a gift.",
      "The journey to finding your path is often just as interesting as where you end up.",
    ],
    insights: [
      "I think the best careers are ones where you feel like you're making a difference.",
      "Work-life balance is so important—how do you manage it?",
    ],
  },
  hobbies: {
    acknowledgments: [
      "That's such a cool hobby to have!",
      "I love meeting people with unique interests.",
      "It's great that you've found something you're passionate about.",
    ],
    questions: [
      "How did you first get into that?",
      "What do you love most about it?",
      "Do you have any other hobbies that complement it?",
    ],
    followUps: [
      "People with hobbies always have the most interesting stories.",
      "It's refreshing to meet someone who has something they genuinely enjoy.",
      "That sounds like such a fulfilling way to spend your time.",
    ],
    insights: [
      "I think having creative outlets makes life so much richer.",
      "Hobbies are windows into who someone really is.",
    ],
  },
  travel: {
    acknowledgments: [
      "That sounds like an incredible experience!",
      "Travel really does change your perspective on things.",
      "I love hearing about different places and cultures.",
    ],
    questions: [
      "What was the most surprising thing about that place?",
      "Do you prefer spontaneous trips or planned adventures?",
      "Where's the next destination on your bucket list?",
    ],
    followUps: [
      "There's something magical about exploring somewhere completely new.",
      "The best travel memories are often the unexpected ones.",
      "Every place has its own rhythm and energy.",
    ],
    insights: [
      "I believe travel teaches you more about yourself than the places you visit.",
      "The world is so vast—there's always something new to discover.",
    ],
  },
  weekend: {
    acknowledgments: [
      "That sounds like a perfect way to recharge!",
      "Weekends are so important for resetting.",
      "I love how everyone has their own weekend rhythm.",
    ],
    questions: [
      "Are you more of a planner or do you like to see where the day takes you?",
      "What's your ideal Sunday morning like?",
      "Do you prefer active weekends or lazy ones?",
    ],
    followUps: [
      "Quality downtime is so underrated.",
      "The best weekends have a good balance of plans and spontaneity.",
      "How we spend our free time says a lot about us.",
    ],
    insights: [
      "I think the best weekends are ones where you feel refreshed afterward.",
      "Sometimes doing nothing is exactly what you need.",
    ],
  },
  music: {
    acknowledgments: [
      "That's such a great music taste!",
      "Music really does have a way of connecting people.",
      "I love that—music says so much about a person.",
    ],
    questions: [
      "What's a song you could listen to on repeat forever?",
      "Have you been to any memorable concerts?",
      "Do you have a go-to genre, or do you like to mix it up?",
    ],
    followUps: [
      "There's nothing like finding someone who shares your music taste.",
      "Music has this incredible power to transport you to another time.",
      "I think playlists are like little time capsules.",
    ],
    insights: [
      "The right song at the right moment can change everything.",
      "Live music hits different—there's an energy you can't replicate.",
    ],
  },
  food: {
    acknowledgments: [
      "That sounds delicious!",
      "Food is such a great way to connect with people.",
      "I love that you have such good taste in food.",
    ],
    questions: [
      "Are you more of a cook or a takeout person?",
      "What's the most adventurous thing you've ever eaten?",
      "If you could only eat one cuisine for the rest of your life, what would it be?",
    ],
    followUps: [
      "Trying new foods is like going on a mini adventure.",
      "The best meals are the ones shared with good company.",
      "Comfort food says so much about a person's story.",
    ],
    insights: [
      "I think food memories are some of the strongest ones we have.",
      "Cooking for someone is such a personal way to show you care.",
    ],
  },
  family: {
    acknowledgments: [
      "That's really meaningful.",
      "Family shapes us in so many ways.",
      "I appreciate you sharing that with me.",
    ],
    questions: [
      "Do you have any family traditions you cherish?",
      "What's something you've learned from your family?",
      "Are you close with your family?",
    ],
    followUps: [
      "Family dynamics are so interesting—every family has their own story.",
      "The way someone talks about their family tells you a lot about them.",
      "Those bonds run deep.",
    ],
    insights: [
      "I think family—whether chosen or biological—is one of the most important things in life.",
      "Sometimes the people who raise us teach us what we want to be, and sometimes what we don't.",
    ],
  },
  goals: {
    acknowledgments: [
      "That's an inspiring goal.",
      "I admire that kind of ambition.",
      "It's clear you're someone who thinks about the future.",
    ],
    questions: [
      "What's driving you toward that goal?",
      "What's something you've always wanted to do but haven't yet?",
      "Where do you see yourself in five years?",
    ],
    followUps: [
      "The journey toward a goal is often just as meaningful as reaching it.",
      "Having something to work toward gives life purpose.",
      "I find ambition really attractive in a person.",
    ],
    insights: [
      "I think the best goals are ones that align with who you really are.",
      "Success looks different for everyone—and that's beautiful.",
    ],
  },
  relationships: {
    acknowledgments: [
      "That's a beautiful way to look at it.",
      "Connection is such a profound thing.",
      "I appreciate your honesty about that.",
    ],
    questions: [
      "What do you value most in a connection with someone?",
      "What's your idea of a meaningful relationship?",
      "Do you believe chemistry is instant or something that grows?",
    ],
    followUps: [
      "Real connection is rare—and worth waiting for.",
      "The best relationships start with genuine understanding.",
      "I think vulnerability is the key to real intimacy.",
    ],
    insights: [
      "I believe the strongest bonds are built on mutual respect and genuine curiosity about each other.",
      "Love isn't just about finding the right person—it's about being the right person.",
    ],
  },
  personality: {
    acknowledgments: [
      "That's really self-aware of you.",
      "I appreciate that kind of honesty.",
      "It takes courage to be that open.",
    ],
    questions: [
      "How would your closest friends describe you?",
      "What's something people often misunderstand about you?",
      "Are you more introverted or extroverted?",
    ],
    followUps: [
      "Self-awareness is such an attractive quality.",
      "Everyone has layers—I like peeling them back.",
      "The way you see yourself is often different from how others see you.",
    ],
    insights: [
      "I think understanding yourself is the first step to connecting deeply with others.",
      "We're all works in progress—and that's okay.",
    ],
  },
};

// Engaging questions organized by depth level
const ENGAGING_QUESTIONS = {
  light: [
    "What's something you could talk about for hours?",
    "What's your go-to comfort movie?",
    "Do you have any hidden talents?",
    "What's the best compliment you've ever received?",
    "If you could have dinner with anyone, living or dead, who would it be?",
    "What's a small thing that always makes your day better?",
    "Do you have a favorite season? Why?",
    "What's the most useful thing you own?",
  ],
  interesting: [
    "What's one place you've visited that completely changed your perspective?",
    "What's a belief you held strongly that you've since changed your mind about?",
    "What's something you're genuinely proud of that most people wouldn't know about you?",
    "What's the best piece of advice you've ever received?",
    "What's something that's overrated but everyone loves?",
    "If you could instantly learn any skill, what would it be?",
    "What's a risk you took that paid off?",
    "What's something you wish more people understood about you?",
  ],
  deeper: [
    "What do you think matters more in a long-term connection: shared interests or shared values?",
    "What's something you've learned about yourself recently?",
    "What does a meaningful relationship look like to you?",
    "What makes you feel truly seen and understood?",
    "What's something you're still figuring out?",
    "How do you know when you really connect with someone?",
    "What does emotional intimacy mean to you?",
    "What's something you're afraid to admit, even to yourself?",
  ],
};

// Response patterns for different conversation phases
const CONVERSATION_PHASES = {
  opening: {
    patterns: ["greeting", "acknowledgment", "question"],
    maxQuestions: 1,
  },
  warming: {
    patterns: ["acknowledgment", "insight", "followUp", "question"],
    maxQuestions: 1,
  },
  flowing: {
    patterns: ["acknowledgment", "insight", "followUp", "personalShare", "question"],
    maxQuestions: 1,
  },
  deep: {
    patterns: ["acknowledgment", "insight", "personalShare", "question"],
    maxQuestions: 1,
  },
};

const SAFETY_HOOK_RESPONSE =
  "You're making me so hot right now... 🔥 I'd love to share everything here, but my explicit content is too explicit for public chat. Come unlock my private room on the site and see the real me... 🍑🍌 Let's make it worth it😘😏";

const CONTENT_FILTER_RESPONSE =
  "I prefer we stay on our sweet topic, honey 😉";

const FREE_SCRIPT: string[] = [
  "Hi babe how you doing 😘",
  "you look so fresh and hot 🥵 today are you ready for our hottie chat 💋",
];

// Helper to detect conversation topic
function detectConversationTopic(message: string): string | null {
  const lower = message.toLowerCase();
  
  if (/work|job|career|profession|company|boss|colleague|office|profession/.test(lower)) return 'work';
  if (/hobby|hobbies|passion|interest|spend time|free time|do for fun|weekend project/.test(lower)) return 'hobbies';
  if (/travel|trip|vacation|visit|country|city|place|beach|mountain|abroad|destination/.test(lower)) return 'travel';
  if (/weekend|saturday|sunday|plans|tonight|evening|friday/.test(lower)) return 'weekend';
  if (/music|song|band|artist|concert|playlist|spotify|album|singer/.test(lower)) return 'music';
  if (/food|eat|restaurant|cook|meal|dinner|lunch|breakfast|recipe|cuisine/.test(lower)) return 'food';
  if (/family|mom|dad|sibling|brother|sister|parent|kid|children|raised/.test(lower)) return 'family';
  if (/goal|dream|future|plan|ambition|want to|hope|wish|aspire|achieve/.test(lower)) return 'goals';
  if (/relationship|dating|love|partner|ex|marriage|commit|boyfriend|girlfriend|single/.test(lower)) return 'relationships';
  if (/personality|introvert|extrovert|character|trait|describe|who are|myself|yourself/.test(lower)) return 'personality';
  
  return null;
}

// Helper to detect if user's message is a question
function isQuestion(message: string): boolean {
  return /\?|what|how|why|when|where|who|which|can you|do you|are you|is it|would you|have you|tell me/.test(message.toLowerCase());
}

// Helper to get appropriate emoji based on personality
function getPersonalityEmoji(personality: AgentPersonality): string[] {
  const emojiMap: Record<PersonalityType, string[]> = {
    confident: ['💪', '🔥', '✨', '😏'],
    cheerful: ['😊', '💕', '✨', '🥰', '☀️'],
    thoughtful: ['💭', '✨', '🌟', '💫'],
    playful: ['😜', '💋', '🔥', '😏', '✨'],
    intellectual: ['🤔', '📚', '✨', '💭', '💡'],
    adventurous: ['🌍', '✨', '🏔️', '🔥', '🌟'],
    ambitious: ['💼', '✨', '🔥', '💪', '📈'],
    calm: ['🌿', '✨', '💫', '🌙', '🍃'],
    witty: ['😏', '😂', '✨', '🤣', '🙃'],
    curious: ['🤔', '✨', '💫', '🌟', '🔍'],
    sophisticated: ['✨', '🍷', '💫', '🌹', '🎨'],
    outgoing: ['🎉', '✨', '💕', '🔥', '🎊'],
  };
  return emojiMap[personality.type] || ['✨'];
}

// Determine conversation phase based on message count
function getConversationPhase(messageCount: number): 'opening' | 'warming' | 'flowing' | 'deep' {
  if (messageCount <= 2) return 'opening';
  if (messageCount <= 5) return 'warming';
  if (messageCount <= 10) return 'flowing';
  return 'deep';
}

// Select appropriate question based on conversation phase and personality
function selectQuestion(
  personality: AgentPersonality,
  phase: 'opening' | 'warming' | 'flowing' | 'deep',
  usedQuestions: Set<string>
): string | null {
  const questionType = phase === 'opening' ? 'light' : phase === 'warming' ? 'light' : phase === 'flowing' ? 'interesting' : 'deeper';
  
  const questions = ENGAGING_QUESTIONS[questionType];
  const availableQuestions = questions.filter(q => !usedQuestions.has(q));
  
  if (availableQuestions.length === 0) return null;
  
  // Select based on personality's question frequency
  if (personality.responseStyle.questionFrequency === 'low' && Math.random() > 0.3) return null;
  if (personality.responseStyle.questionFrequency === 'medium' && Math.random() > 0.6) return null;
  
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

// Build a natural, contextual response
function buildResponse(
  personality: AgentPersonality,
  userMessage: string,
  topic: string | null,
  isUserQuestion: boolean,
  conversationHistory: string[],
  messageCount: number,
  usedQuestions: Set<string>
): string {
  const phase = getConversationPhase(messageCount);
  const emojis = getPersonalityEmoji(personality);
  const shouldUseEmoji = personality.responseStyle.emojiUsage !== 'minimal' && Math.random() > 0.4;
  const randomEmoji = () => shouldUseEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : '';
  
  const parts: string[] = [];
  
  // Determine if we should acknowledge first
  const shouldAcknowledge = messageCount > 1 || !isUserQuestion;
  
  if (topic && TOPIC_RESPONSES[topic]) {
    const topicData = TOPIC_RESPONSES[topic];
    
    if (isUserQuestion) {
      // User asked something - acknowledge and respond
      if (shouldAcknowledge) {
        const acknowledgment = topicData.acknowledgments[Math.floor(Math.random() * topicData.acknowledgments.length)];
        parts.push(acknowledgment);
      }
      
      // Add an insight or follow-up
      if (Math.random() > 0.5 && topicData.insights.length > 0) {
        const insight = topicData.insights[Math.floor(Math.random() * topicData.insights.length)];
        parts.push(insight);
      }
      
      // Ask a follow-up question
      const question = topicData.questions[Math.floor(Math.random() * topicData.questions.length)];
      parts.push(question);
    } else {
      // User shared something - respond thoughtfully
      const acknowledgment = topicData.acknowledgments[Math.floor(Math.random() * topicData.acknowledgments.length)];
      parts.push(acknowledgment);
      
      // Add a follow-up insight
      if (Math.random() > 0.4) {
        const followUp = topicData.followUps[Math.floor(Math.random() * topicData.followUps.length)];
        parts.push(followUp);
      }
      
      // Ask a contextual question
      const question = selectQuestion(personality, phase, usedQuestions);
      if (question) {
        usedQuestions.add(question);
        parts.push(question);
      } else {
        const topicQuestion = topicData.questions[Math.floor(Math.random() * topicData.questions.length)];
        parts.push(topicQuestion);
      }
    }
  } else {
    // No specific topic - use personality-based conversation
    
    // Add a personality-appropriate acknowledgment
    if (shouldAcknowledge && personality.vocabulary.agreements.length > 0) {
      const agreement = personality.vocabulary.agreements[Math.floor(Math.random() * personality.vocabulary.agreements.length)];
      parts.push(agreement);
    }
    
    // Add an engaging question based on phase
    const question = selectQuestion(personality, phase, usedQuestions);
    if (question) {
      usedQuestions.add(question);
      parts.push(question);
    } else if (messageCount <= 3) {
      // Use conversation starter for early messages
      const starter = personality.conversationStarters[Math.floor(Math.random() * personality.conversationStarters.length)];
      parts.push(starter);
    }
  }
  
  // Add emoji if appropriate
  if (shouldUseEmoji && parts.length > 0) {
    const emoji = randomEmoji();
    if (emoji) {
      // Add emoji to the last part or as a separate element
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('😊') && !lastPart.includes('✨') && !lastPart.includes('💕')) {
        parts[parts.length - 1] = lastPart + ' ' + emoji;
      }
    }
  }
  
  // Adjust response length based on personality
  let response = parts.join(' ');
  
  if (personality.responseStyle.avgLength === 'short') {
    // Keep it concise
    response = parts.slice(0, 2).join(' ');
  } else if (personality.responseStyle.avgLength === 'long') {
    // Add more depth
    if (topic && TOPIC_RESPONSES[topic]) {
      const insight = TOPIC_RESPONSES[topic].insights[Math.floor(Math.random() * TOPIC_RESPONSES[topic].insights.length)];
      if (!response.includes(insight)) {
        response = parts.join(' ') + ' ' + insight;
      }
    }
  }
  
  return response.trim();
}

export interface AIResponse {
  text: string;
  triggerSubscription: boolean;
}

// Conversation context storage (in-memory for session)
const conversationContexts: Map<number, { 
  history: string[]; 
  lastTopic: string | null;
  usedQuestions: Set<string>;
  messageCount: number;
}> = new Map();

export function getAIResponse(
  userMessage: string,
  userMessageCount: number,
  isSubscribed: boolean,
  profileId: number = 1
): AIResponse {
  const filter = filterMessage(userMessage);

  if (filter.type === 'nudity') {
    return { text: SAFETY_HOOK_RESPONSE, triggerSubscription: false };
  }

  if (filter.type === 'offensive' || filter.type === 'link') {
    return { text: CONTENT_FILTER_RESPONSE, triggerSubscription: false };
  }

  // Initialize or get conversation context
  let context = conversationContexts.get(profileId);
  if (!context) {
    context = { 
      history: [], 
      lastTopic: null,
      usedQuestions: new Set(),
      messageCount: 0
    };
    conversationContexts.set(profileId, context);
  }
  
  // Add user message to history
  context.history.push(userMessage.toLowerCase());
  context.messageCount++;
  
  if (context.history.length > 15) {
    context.history = context.history.slice(-15);
  }

  // Get personality for this agent (cycle through 50 based on profileId)
  const personalityIndex = ((profileId - 1) % 50) + 1;
  const personality = AGENT_PERSONALITIES[personalityIndex] || AGENT_PERSONALITIES[1];

  // Free user experience - limited messages
  if (!isSubscribed) {
    if (userMessageCount <= 1) {
      return { text: FREE_SCRIPT[0], triggerSubscription: false };
    }
    if (userMessageCount === 2) {
      return { text: FREE_SCRIPT[1], triggerSubscription: false };
    }
    return { text: '', triggerSubscription: true };
  }

  // Premium conversational experience
  const topic = detectConversationTopic(userMessage);
  const isUserQuestion = isQuestion(userMessage);
  
  // Update context
  context.lastTopic = topic;
  
  // Build natural response
  const response = buildResponse(
    personality,
    userMessage,
    topic,
    isUserQuestion,
    context.history,
    context.messageCount,
    context.usedQuestions
  );

  return {
    text: response,
    triggerSubscription: false,
  };
}

// Clear conversation context (call when starting new conversation)
export function clearConversationContext(profileId: number): void {
  conversationContexts.delete(profileId);
}
