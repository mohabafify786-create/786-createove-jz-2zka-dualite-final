const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

const OFFENSIVE_WORDS = [
  'fuck off', 'go to hell', 'kill yourself', 'die', 'kys',
  'piece of shit', 'worthless', 'scam', 'fake', 'bot',
];

const NUDITY_KEYWORDS = [
  'nude', 'nudes', 'naked', 'nudity', 'strip', 'undress',
  'sex call', 'sex video', 'sex chat', 'sext',
  'send pic', 'send photo', 'send vid', 'send video',
  'show me', 'show your', 'show body',
  'onlyfans', 'explicit', 'porn', 'xxx',
  'dick pic', 'boobs', 'tits', 'ass pic', 'pussy',
  'topless', 'bottomless', 'lingerie pic',
  'video call', 'facetime', 'cam show',
  'private photo', 'private video', 'private pic',
  'real photo', 'real pic', 'selfie nude',
];

export type FilterResult =
  | { type: 'clean' }
  | { type: 'nudity' }
  | { type: 'offensive' }
  | { type: 'link' };

export function filterMessage(text: string): FilterResult {
  const lower = text.toLowerCase().trim();

  if (URL_PATTERN.test(lower)) {
    return { type: 'link' };
  }

  for (const word of NUDITY_KEYWORDS) {
    if (lower.includes(word)) {
      return { type: 'nudity' };
    }
  }

  for (const word of OFFENSIVE_WORDS) {
    if (lower.includes(word)) {
      return { type: 'offensive' };
    }
  }

  return { type: 'clean' };
}
