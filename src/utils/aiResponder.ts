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

// ── Safety & Content Filter Responses (Preserved) ───────────────────────────
export const SAFETY_HOOK_RESPONSE =
  "You're making me so hot right now... 🔥 I'd love to share everything here, but my explicit content is too explicit for public chat. Come unlock my private room on the site and see the real me... 🍑🍌 Let's make it worth it😘😏";

export const CONTENT_FILTER_RESPONSE =
  "I prefer we stay on our sweet topic, honey 😉";

export const FREE_SCRIPT: string[] = [
  "Hi babe how you doing 😘",
  "you look so fresh and hot 🥵 today are you ready for our hottie chat 💋",
];

export interface AIResponse {
  text: string;
  triggerSubscription: boolean;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ConversationContext {
  key: string;
  turns: ConversationTurn[];
  messageCount: number;
  lastAssistantHadQuestion: boolean;
  consecutiveNoQuestionCount: number;
}

// Conversation context storage — isolated per conversation/session + profile
const conversationContexts: Map<string, ConversationContext> = new Map();

// Helper to avoid repeating identical responses in the same conversation
function pickNotRecentlyUsed(options: string[], context: ConversationContext): string {
  const recentAssistantTexts = context.turns
    .filter((t) => t.role === 'assistant')
    .map((t) => t.text.toLowerCase().trim());

  const fresh = options.filter((opt) => !recentAssistantTexts.includes(opt.toLowerCase().trim()));
  if (fresh.length > 0) {
    return fresh[Math.floor(Math.random() * fresh.length)];
  }
  return options[Math.floor(Math.random() * options.length)];
}

// Helper to detect conversation topic for optional semantic context
export function detectConversationTopic(message: string): string | null {
  const lower = message.toLowerCase();
  if (/work|job|career|profession|company|boss|colleague|office|engineer|coding/.test(lower)) return 'work';
  if (/dog|cat|puppy|kitten|pet|retriever|rescue|husky|poodle|corgi/.test(lower)) return 'pets';
  if (/chill|relaxing|lying in bed|couch|lazy day|unwinding|netflix|binge/.test(lower)) return 'chill';
  if (/hobby|hobbies|passion|spend time|free time|do for fun/.test(lower)) return 'hobbies';
  if (/travel|trip|vacation|visit|country|city|beach|flight|istanbul|paris|tokyo|italy/.test(lower)) return 'travel';
  if (/weekend|saturday|sunday|friday|plans tonight/.test(lower)) return 'weekend';
  if (/music|song|band|artist|concert|playlist|spotify/.test(lower)) return 'music';
  if (/food|eat|restaurant|cook|dinner|lunch|breakfast|pizza|tacos|sushi|pasta/.test(lower)) return 'food';
  if (/gym|workout|fitness|lifting|running|6am|leg day/.test(lower)) return 'fitness';
  if (/monday/.test(lower)) return 'monday';
  if (/dating|date|relationship|love|chemistry|crush|single/.test(lower)) return 'dating';
  return null;
}

// Helper to detect if user message is an explicit question
function isDirectUserQuestion(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (clean.includes('?')) return true;
  return /^(what|how|why|when|where|who|which|are you|do you|can you|would you|have you|tell me|is it)\b/i.test(clean);
}

// Anti-therapist sanitizer to ensure no robotic or clinical phrases leak out
function sanitizeAgainstTherapySpeak(text: string): string {
  const therapyReplacements: [RegExp, string][] = [
    [/that resonates with me/gi, "I totally get that"],
    [/i appreciate your perspective/gi, "fair point honestly"],
    [/thank you for sharing/gi, "thanks for telling me"],
    [/what does that mean to you\??/gi, ""],
    [/how does that make you feel\??/gi, ""],
    [/what have you learned about yourself\??/gi, ""],
    [/that's very self-aware/gi, "that's pretty cool honestly"],
    [/what does a meaningful relationship look like to you\??/gi, ""],
    [/i hear you\./gi, "I feel you."],
    [/that sounds like a meaningful journey/gi, "that sounds like quite an adventure"],
  ];

  let result = text;
  for (const [pattern, replacement] of therapyReplacements) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Handle direct questions from user:
 * Direct questions must ALWAYS be answered first with real opinions and personality!
 * Only optionally add a reciprocal question (~30-35% of the time, and never twice in a row).
 */
function handleDirectQuestion(
  clean: string,
  personality: AgentPersonality,
  profileInterests: string[],
  lastHadQuestion: boolean
): string | null {
  const pType = personality.type;
  const allowFollowUpQuestion = !lastHadQuestion && Math.random() < 0.35;

  // 1. Movie / Show questions (Prompt requirement: answer first, optionally ask "What's yours?")
  if (/movie|film|watch|netflix|show|series/i.test(clean) && /(favorite|favourite|best|recommend|like)/i.test(clean)) {
    const answers: Record<string, string> = {
      witty: "Probably something sharp that I can watch twice and still catch new jokes. Interstellar or Inception when I want to pretend I'm deep 😂",
      intellectual: "Probably something I can watch twice and still notice new things. Interstellar is dangerously close to that category for me.",
      playful: "Anything with top-tier banter or suspense! Give me a movie with crazy twists and I'm glued to the screen 😏",
      thoughtful: "Arrival or Interstellar—films that stay with you long after the credits roll.",
      cheerful: "I'm a sucker for great feel-good films or thrillers with incredible soundtracks!",
      default: "Probably something I can watch twice and still notice new things. Interstellar is dangerously close to that category for me.",
    };
    const answer = answers[pType] || answers.default;
    return allowFollowUpQuestion ? `${answer} What's yours?` : answer;
  }

  // 2. Music questions (Prompt Example 2: Answer first, optionally ask)
  if (/music|song|artist|band|playlist|listen to/i.test(clean)) {
    const answers: Record<string, string> = {
      witty: "My playlist is pure chaos—one minute it's late-night indie rock, the next it's 2000s throwback anthems 😂",
      thoughtful: "I'm definitely biased toward anything with a little atmosphere to it. Give me something moody I can listen to late at night and I'm sold.",
      playful: "Anything with great bass and infectious energy. If it doesn't make you want to drive fast with the windows down, what's the point? 😏",
      confident: "Anything with strong rhythm and attitude. R&B or indie with good vocals never fails.",
      cheerful: "Upbeat tracks all the way! Anything with great energy that puts you in an instant good mood ✨",
      default: "I'm definitely biased toward anything with a little atmosphere to it. Give me something I can listen to late at night and I'm sold.",
    };
    const answer = answers[pType] || answers.default;
    return allowFollowUpQuestion ? `${answer} What about you?` : answer;
  }

  // 3. Food / Drink questions
  if (/food|dish|cuisine|eat|restaurant|cook|dinner/i.test(clean)) {
    const answers: Record<string, string> = {
      playful: "Handmade pasta and authentic street tacos will make me abandon all self-control in about three seconds 🤤",
      witty: "Anything that doesn't pretend to be a salad. Fresh sushi and warm pizza hold joint custody of my soul 😂",
      adventurous: "I'll try literally anything once, but amazing street food in a busy night market is peak happiness for me.",
      default: "Handmade pasta or fresh tacos—I have basically zero willpower when the food is that good.",
    };
    const answer = answers[pType] || answers.default;
    return allowFollowUpQuestion ? `${answer} What's your go-to comfort food?` : answer;
  }

  // 4. Coffee vs Tea / Morning drink
  if (/coffee|tea|latte|espresso|drink/i.test(clean) && /(or|prefer|like|favorite)/i.test(clean)) {
    return "I run on iced coffee and mild optimism, to be completely transparent 😂";
  }

  // 5. Work / Occupation questions
  if (/(what do you do|what('s| is) your job|what('s| is) your work|career)/i.test(clean)) {
    const interest = profileInterests[0] || 'creative projects';
    return `I spend most of my time in ${interest}—basically juggling projects, staying inspired, and having way too many tabs open at all times.`;
  }

  // 6. Weekend / Free time questions
  if (/(weekend|free time|spare time|saturday|sunday)/i.test(clean)) {
    const answers: Record<string, string> = {
      adventurous: "Usually escaping the apartment—trying a new spot, hiking, or spontaneous day trips with good company.",
      calm: "Sleep in, grab ridiculous coffee, read a bit, and let the day unfold without any rush.",
      outgoing: "Brunch that accidentally turns into late afternoon drinks, or checking out live music with friends!",
      default: "A mix of good coffee, zero alarms, and seeing where the day leads without over-planning.",
    };
    const answer = answers[pType] || answers.default;
    return allowFollowUpQuestion ? `${answer} What's your ideal weekend?` : answer;
  }

  // 7. Ideal Date question
  if (/(ideal date|perfect date|first date)/i.test(clean)) {
    const answers: Record<string, string> = {
      playful: "Somewhere dimly lit with incredible drinks and banter so effortless that neither of us checks the time 😏",
      witty: "Somewhere low-pressure where we can actually talk. If we're two hours in and still laughing, that's the only benchmark that matters.",
      default: "Somewhere casual with great atmosphere and good drinks. Chemistry is all in the conversation anyway.",
    };
    const answer = answers[pType] || answers.default;
    return allowFollowUpQuestion ? `${answer} What about you?` : answer;
  }

  // 8. Are you real / AI / Bot
  if (/(are you real|are you a bot|are you ai|are you human)/i.test(clean)) {
    return "Real enough to have strong opinions and judge your music taste 😉";
  }

  // 9. Where are you from / live
  if (/(where (are you|do you live|are you from)|which city)/i.test(clean)) {
    return "Living in the city right now! Love the energy here, though escaping to the beach or somewhere scenic is always on my mind.";
  }

  // 10. How are you / what are you up to / wyd / how's your day
  if (/(how are you|how('s| is) your day|what are you up to|wyd|what('s| is) up)/i.test(clean)) {
    const greetings = [
      "Doing pretty well! Just taking a breather and unwinding. How's your day treating you?",
      "Can't complain! Enjoying a little downtime. Good timing by the way 😊",
      "Pretty solid day so far. Caught up on things and ready to relax a bit.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 11. Do you believe in love at first sight / soulmates
  if (/(love at first sight|soulmates|destiny)/i.test(clean)) {
    return "I believe in instant chemistry for sure—but the real connection comes when the conversation actually flows like this.";
  }

  return null;
}

/**
 * Handle specific user statements, entity mentions, banter, and stories:
 * React directly to the content, entities, and mood with genuine dating partner voice!
 */
function handleStatementReaction(
  clean: string,
  personality: AgentPersonality,
  _lastHadQuestion: boolean,
  context: ConversationContext
): string | null {
  const pType = personality.type;

  // 1. Monday statement (Prompt Example 1: User says "I hate Mondays")
  if (/hate monday|mondays suck|ugh monday|another monday|case of the monday/i.test(clean)) {
    return "Mondays really do wake up every week ready to ruin someone's mood 😂";
  }

  // 2. Early Gym / Morning Workout (Prompt Example 3: User says "I went to the gym at 6am today")
  if (/(gym at 6|6am|workout at 6|woke up at 6|hit the gym at 6|6 am)/i.test(clean)) {
    return "At 6am?! That's either impressive discipline or questionable decision-making 😂";
  }
  if (/leg day/i.test(clean)) {
    return "Leg day? Please tell me you don't have to navigate any flights of stairs today 😭";
  }
  if (/gym|workout|lifting|ran \d|crossfit/i.test(clean)) {
    return "Getting the workout done is such a satisfying feeling once it's over. Good for you!";
  }

  // 3. Software Engineer / Tech (Prompt Example 4: User says "I work as a software engineer")
  if (/software engineer|developer|coder|programming|coding|write code/i.test(clean)) {
    return "So you're professionally qualified to say \"it works on my machine\" 😏";
  }

  // 4. Project Finished / Milestone / Exam Win (Prompt Example 5: User says "I finally finished my project")
  if (/(finally finished|finished (my|that|the) project|passed (my|the) exam|got the job|got promoted|wrapped up (my|the)|turned in)/i.test(clean)) {
    return "Finally 😭 You survived. That's actually a pretty satisfying feeling.";
  }

  // 5. Istanbul / Specific Destination (Prompt Example 6: User says "I just got back from Istanbul. The food was insane.")
  if (/istanbul/i.test(clean)) {
    return "Istanbul is dangerous if you actually like food 😂 I'm already jealous. What was the one thing you couldn't stop eating?";
  }
  if (/paris/i.test(clean)) {
    return "Paris has that unfair habit of making everyday life look like a movie scene ✨";
  }
  if (/tokyo/i.test(clean)) {
    return "Tokyo is completely unmatched. I would probably spend 90% of my time in ramen shops and convenience stores 😂";
  }
  if (/italy|rome|florence|milan/i.test(clean)) {
    return "Italy ruins regular pasta forever. Please tell me you ate gelato at least twice a day?";
  }

  // 6. Dogs / Cats / Pets
  if (/(dog|cat|puppy|kitten|golden retriever|labrador|frenchie|corgi|rescue dog|pet|my dog|my cat)/i.test(clean)) {
    return pickNotRecentlyUsed([
      "Instant green flag right there 🐶 Having a pet automatically gives you bonus points.",
      "Wait, that's adorable! Please tell me you have photos because that is essential information.",
      "Pets make life infinitely better. Honestly an immediate win in my book.",
    ], context);
  }

  // 7. General Food was insane / Foodie moments
  if (/food was (insane|crazy|amazing|unreal|so good)|delicious|ate so much/i.test(clean)) {
    return "Now you're speaking my language! Truly good food makes everything in life about 10x better.";
  }

  // 8. Friday / Weekend arrival
  if (/friday (finally|is here|night)|tgif|weekend is here|ready for the weekend/i.test(clean)) {
    return "The collective sigh of relief when Friday arrives is unmatched 🙌";
  }

  // 9. Exhausted / Tired / Hard day
  if (/exhausted|so tired|long day|rough day|drained|need sleep/i.test(clean)) {
    return "Put your phone down, kick your feet up, and go into full horizontal mode. You definitely earned a break tonight.";
  }

  // 10. Jokes / Laughter
  if (/^(haha|hahaha|lol|lmao|rofl|😂|🤣)+$/i.test(clean)) {
    const laughResponses = [
      "Glad I could make you laugh, that's half the battle won 😉",
      "See? We're already on the same wavelength 😏",
      "I pride myself on quality comedic timing 😂",
    ];
    return pickNotRecentlyUsed(laughResponses, context);
  }

  // 11. Flirting / Compliments to AI
  if (/(you('re| are) (so )?(cute|pretty|beautiful|hot|gorgeous|attractive|funny)|love your smile|great eyes|you look good|stunning)/i.test(clean)) {
    if (pType === 'confident') {
      return "I like where your head's at. You definitely know how to make an impression 😏";
    }
    if (pType === 'playful' || pType === 'witty') {
      return "Careful, keep talking like that and it'll go straight to my head 😏";
    }
    return "Well thank you... you're making yourself sound suspiciously charming yourself 😉";
  }

  // 12. Playful Disagreement / Hot Takes
  if (/(pineapple on pizza|cats vs dogs|unpopular opinion|hot take|fight me)/i.test(clean)) {
    return "Okay, I'm judging you a little for that take 😏 But I respect the boldness.";
  }

  // 13. Short generic openers
  if (/^(hey|hi|hello|hey there|sup|yo|good morning|good evening)$/i.test(clean)) {
    const openers = [
      "Hey! How's your day treating you so far?",
      "Hey there 😊 Caught you at a good time?",
      "Hi! Hope your day's been good so far.",
    ];
    return pickNotRecentlyUsed(openers, context);
  }

  // 14. Coffee / caffeine love
  if (/need coffee|caffeine|iced coffee|coffee addict/i.test(clean)) {
    return "Coffee first, adulting second. That's the only respectable policy ☕";
  }

  // 15. Teasing / sassy remarks
  if (/you('re| are) trouble|you('re| are) dangerous/i.test(clean)) {
    return "Only the best kind of trouble 😉 You don't strike me as someone who plays it completely safe either.";
  }

  return null;
}

/**
 * Generate a dynamic, contextual, non-scripted response:
 * - Uses the user's actual words
 * - Respects the agent's behavioral personality
 * - Answers direct questions first
 * - NEVER forces a question into every turn
 * - NEVER uses therapist/interviewer speech
 */
function buildNaturalDatingResponse(
  userMessage: string,
  personality: AgentPersonality,
  context: ConversationContext
): string {
  const clean = userMessage.trim();
  const lastHadQuestion = context.lastAssistantHadQuestion;

  // Step 1: Direct question from user?
  if (isDirectUserQuestion(clean)) {
    const directAns = handleDirectQuestion(clean, personality, personality.interests, lastHadQuestion);
    if (directAns) {
      return sanitizeAgainstTherapySpeak(directAns);
    }
  }

  // Step 2: Specific entity or statement reaction?
  const statementAns = handleStatementReaction(clean, personality, lastHadQuestion, context);
  if (statementAns) {
    return sanitizeAgainstTherapySpeak(statementAns);
  }

  // Step 3: Contextual fallback derived directly from user's message keywords
  const topic = detectConversationTopic(clean);
  const pType = personality.type;

  let baseResponse = "";
  let includeQuestion = false;

  // Decide if we should include a natural question:
  // Strictly NO question if assistant asked one on previous turn or if random check says no.
  if (!lastHadQuestion && Math.random() < 0.28) {
    includeQuestion = true;
  }

  if (topic === 'travel') {
    if (pType === 'adventurous' || pType === 'confident') {
      baseResponse = pickNotRecentlyUsed([
        "Traveling is the best kind of reset. Coming back to reality after an amazing trip is always the hardest part though.",
        "Exploring somewhere completely new is unmatched. I always get the travel bug the second I get home.",
      ], context);
    } else {
      baseResponse = pickNotRecentlyUsed([
        "There's nothing quite like exploring a completely new city. It completely shifts your perspective.",
        "Traveling always gives you the best stories. Coming back to regular life is always surreal.",
      ], context);
    }
    if (includeQuestion) baseResponse += " Where's the next place on your bucket list?";
  } else if (topic === 'food') {
    baseResponse = pickNotRecentlyUsed([
      "Good food makes everything in life about ten times better. Life's way too short for boring meals.",
      "Honestly, finding an incredible meal is one of life's greatest pleasures.",
    ], context);
    if (includeQuestion) baseResponse += " Are you more of a cook-at-home or takeout enthusiast?";
  } else if (topic === 'pets') {
    baseResponse = pickNotRecentlyUsed([
      "Pets make life infinitely better. Having an animal to come home to is the best mood boost.",
      "Honestly animals are the greatest judges of character. Instant green flag in my book.",
    ], context);
  } else if (topic === 'chill') {
    baseResponse = pickNotRecentlyUsed([
      "Quality downtime is severely underrated. Doing absolutely nothing without guilt is top-tier.",
      "A solid low-key chill session is undefeated. Best way to recharge honestly.",
    ], context);
  } else if (topic === 'work') {
    if (pType === 'witty' || pType === 'playful') {
      baseResponse = pickNotRecentlyUsed([
        "Work can definitely be a grind, but finding people who make the days funny makes a huge difference.",
        "The work hustle is real! Hopefully you're not drowning in endless meetings today.",
      ], context);
    } else {
      baseResponse = pickNotRecentlyUsed([
        "Having work you actually care about is such a game-changer. Balance is everything though.",
        "Navigating the workday balance is an art form honestly.",
      ], context);
    }
  } else if (topic === 'music') {
    baseResponse = pickNotRecentlyUsed([
      "The right playlist at the right moment can completely turn your day around.",
      "Good music makes even ordinary days feel like a soundtrack.",
    ], context);
    if (includeQuestion) baseResponse += " What song do you have on repeat right now?";
  } else if (topic === 'weekend') {
    baseResponse = pickNotRecentlyUsed([
      "Unscheduled weekends are honestly undefeated. Just waking up and doing whatever sounds fun in the moment.",
      "Weekends without alarms are the purest form of luxury.",
    ], context);
  } else if (topic === 'dating') {
    baseResponse = pickNotRecentlyUsed([
      "Good banter and effortless chemistry are honestly rare. When you find someone you can actually banter with, it stands out.",
      "Mutual connection is all about the vibe. Either it flows or it doesn't.",
    ], context);
  } else {
    // General conversational reaction matching personality tone with variety
    const wittyPool = [
      "I like how your mind works 😂 Definitely keeps the conversation entertaining.",
      "Fair enough, I can't even argue with that logic 😂",
      "You've got good banter, I'll give you that 😉",
    ];
    const playfulPool = [
      "You're definitely fun to chat with 😏 I had a feeling we'd click.",
      "I see what you did there 😏 Keeping me on my toes.",
      "Okay, now you're just showing off that charm 😉",
    ];
    const confidentPool = [
      "I respect that. You seem like someone who knows what they're about.",
      "I like the confidence. Definitely stands out.",
      "Can't disagree with that. Direct and to the point.",
    ];
    const cheerfulPool = [
      "Love that energy! You seem super easygoing to talk to ✨",
      "That put a genuine smile on my face! Loving the vibe ✨",
      "You're so refreshing to talk to! Always bringing good energy ✨",
    ];
    const calmPool = [
      "That's such a great way to look at it. Really refreshing.",
      "I really appreciate that calm perspective. It's nice to chat without any rush.",
      "That feels so grounded. Definitely agree with you there.",
    ];
    const intellectualPool = [
      "That's an interesting take. It's rare to hear someone put it that way.",
      "That actually gives me something to think about. Good perspective.",
      "I like how you framed that. Definitely a thought-provoking angle.",
    ];
    const defaultPool = [
      "I totally get that. It's fun chatting with someone who actually holds a conversation!",
      "Fair point! It's so nice when a conversation actually flows naturally.",
      "Couldn't agree more honestly. Good vibes all around.",
    ];

    if (pType === 'witty') {
      baseResponse = pickNotRecentlyUsed(wittyPool, context);
    } else if (pType === 'playful') {
      baseResponse = pickNotRecentlyUsed(playfulPool, context);
    } else if (pType === 'confident') {
      baseResponse = pickNotRecentlyUsed(confidentPool, context);
    } else if (pType === 'cheerful') {
      baseResponse = pickNotRecentlyUsed(cheerfulPool, context);
    } else if (pType === 'calm') {
      baseResponse = pickNotRecentlyUsed(calmPool, context);
    } else if (pType === 'intellectual') {
      baseResponse = pickNotRecentlyUsed(intellectualPool, context);
    } else {
      baseResponse = pickNotRecentlyUsed(defaultPool, context);
    }
  }

  return sanitizeAgainstTherapySpeak(baseResponse);
}

// Fetch response from server-side LLM endpoint (/api/chat)
async function fetchRemoteLLMResponse(
  userMessage: string,
  personality: AgentPersonality,
  recentHistory: ConversationTurn[]
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        personality: {
          type: personality.type,
          traits: personality.traits,
          interests: personality.interests,
          humorStyle: personality.humorStyle,
          emotionalTone: personality.emotionalTone,
        },
        history: recentHistory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.success && typeof data.text === 'string' && data.text.trim()) {
      return data.text.trim();
    }
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Main AI response entry point:
 * Returns Promise<AIResponse> using server-side LLM as primary
 * and buildNaturalDatingResponse as reliable zero-downtime fallback.
 */
export async function getAIResponse(
  userMessage: string,
  userMessageCount: number,
  isSubscribed: boolean,
  profileId: number = 1,
  conversationId?: number | string
): Promise<AIResponse> {
  // 1. Content filtering & safety controls (Preserved)
  const filter = filterMessage(userMessage);

  if (filter.type === 'nudity') {
    return { text: SAFETY_HOOK_RESPONSE, triggerSubscription: false };
  }

  if (filter.type === 'offensive' || filter.type === 'link') {
    return { text: CONTENT_FILTER_RESPONSE, triggerSubscription: false };
  }

  // 2. Free user experience - limited scripted teaser messages (Preserved)
  if (!isSubscribed) {
    if (userMessageCount <= 1) {
      return { text: FREE_SCRIPT[0], triggerSubscription: false };
    }
    if (userMessageCount === 2) {
      return { text: FREE_SCRIPT[1], triggerSubscription: false };
    }
    return { text: '', triggerSubscription: true };
  }

  // 3. Conversation state isolation:
  // Key isolated by conversation/session ID + profile ID so different users/chats don't collide
  const contextKey = conversationId
    ? `conv_${conversationId}_p_${profileId}`
    : `prof_${profileId}`;

  let context = conversationContexts.get(contextKey);
  if (!context) {
    context = {
      key: contextKey,
      turns: [],
      messageCount: 0,
      lastAssistantHadQuestion: false,
      consecutiveNoQuestionCount: 0,
    };
    conversationContexts.set(contextKey, context);
  }

  // Snapshot recent history for LLM multi-turn context
  const recentHistory = context.turns.slice(-8);

  // Record user turn into conversation memory
  context.turns.push({ role: 'user', text: userMessage });
  context.messageCount++;

  // Keep sliding window of recent conversation context
  if (context.turns.length > 20) {
    context.turns = context.turns.slice(-20);
  }

  // 4. Resolve agent personality
  const personalityIndex = ((profileId - 1) % 50) + 1;
  const personality = AGENT_PERSONALITIES[personalityIndex] || AGENT_PERSONALITIES[1];

  // 5. Primary: Remote LLM Generation
  let finalResponse = '';
  const remoteText = await fetchRemoteLLMResponse(userMessage, personality, recentHistory);

  if (remoteText) {
    const cleaned = sanitizeAgainstTherapySpeak(
      remoteText.replace(/^(assistant|agent|heartsync|model):\s*/i, '').trim()
    );
    if (cleaned.length > 0 && cleaned.length < 500) {
      finalResponse = cleaned;
    }
  }

  // 6. Fallback: Local rule-based natural dating responder
  if (!finalResponse) {
    finalResponse = buildNaturalDatingResponse(userMessage, personality, context);
  }

  // Record assistant response into conversation memory
  context.turns.push({ role: 'assistant', text: finalResponse });
  const hasQuestion = finalResponse.includes('?');
  context.lastAssistantHadQuestion = hasQuestion;
  if (!hasQuestion) {
    context.consecutiveNoQuestionCount++;
  } else {
    context.consecutiveNoQuestionCount = 0;
  }

  return {
    text: finalResponse,
    triggerSubscription: false,
  };
}

/**
 * Clear conversation context for a given profile/conversation
 */
export function clearConversationContext(profileId: number, conversationId?: number | string): void {
  if (conversationId) {
    conversationContexts.delete(`conv_${conversationId}_p_${profileId}`);
  }
  conversationContexts.delete(`prof_${profileId}`);
}
