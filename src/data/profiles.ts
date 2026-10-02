import { Profile } from '../types/profile';
import { faker } from '@faker-js/faker';

// All 50 profile images in sequential order (indices 0-49)
const PROFILE_IMAGES: string[] = [
  'https://i.ibb.co/5WqjdtBV/Picsart-26-09-01-01-08-11-317.jpg',
  'https://i.ibb.co/7MvyQqk/Picsart-26-09-01-01-10-39-422.jpg',
  'https://i.ibb.co/DN1KMwL/Picsart-26-09-01-01-11-51-904.jpg',
  'https://i.ibb.co/DDSpbyyb/Picsart-26-09-01-01-13-00-265.jpg',
  'https://i.ibb.co/ywr3HH7/Picsart-26-09-01-01-14-24-868.jpg',
  'https://i.ibb.co/PZZ8tzCL/Picsart-26-09-01-01-16-52-074.jpg',
  'https://i.ibb.co/mCcR4Z4t/Picsart-26-09-01-01-20-14-513.jpg',
  'https://i.ibb.co/NnY1BPmH/Picsart-26-09-01-01-23-07-926.jpg',
  'https://i.ibb.co/LdKZGvC3/Picsart-26-09-01-01-24-22-392.jpg',
  'https://i.ibb.co/1G0kjSTy/Picsart-26-09-01-01-27-07-192.jpg',
  'https://i.ibb.co/QFMqX9zz/Picsart-26-09-01-01-27-44-497.jpg',
  'https://i.ibb.co/wr6xm4vz/Picsart-26-09-01-01-35-39-285.jpg',
  'https://i.ibb.co/vvBC0zgx/Picsart-26-09-01-01-39-43-975.jpg',
  'https://i.ibb.co/ynx80hrk/Picsart-26-09-01-01-40-39-988.jpg',
  'https://i.ibb.co/SXGxGFYV/Picsart-26-09-01-01-44-44-132.jpg',
  'https://i.ibb.co/PsFkhzLn/Picsart-26-09-01-01-45-55-551.jpg',
  'https://i.ibb.co/7NKxcGy2/Picsart-26-09-01-01-47-23-847.jpg',
  'https://i.ibb.co/Nnm9hp9n/Picsart-26-09-01-01-48-39-159.jpg',
  'https://i.ibb.co/whvQ1GcG/Picsart-26-09-01-01-50-04-564.jpg',
  'https://i.ibb.co/nsWzvYBD/Picsart-26-09-01-01-53-34-282.jpg',
  'https://i.ibb.co/0j8zLwmD/Picsart-26-09-01-01-56-09-352.jpg',
  'https://i.ibb.co/7xnMV1G1/Picsart-26-09-01-01-57-59-494.jpg',
  'https://i.ibb.co/KxZfbgM3/Picsart-26-09-01-02-02-14-867.jpg',
  'https://i.ibb.co/nMSST7F7/Picsart-26-09-01-02-03-45-330.jpg',
  'https://i.ibb.co/LX1sXJsp/Picsart-26-09-01-02-05-59-415.jpg',
  'https://i.ibb.co/S40nCjzM/Picsart-26-09-01-02-06-34-820.jpg',
  'https://i.ibb.co/TBzRV9qH/Picsart-26-09-01-02-08-30-429.jpg',
  'https://i.ibb.co/27jk2KQM/Picsart-26-09-01-02-10-08-575.jpg',
  'https://i.ibb.co/k2yVp1MR/Picsart-26-09-01-02-12-10-677.jpg',
  'https://i.ibb.co/S4rcHYNn/Picsart-26-09-01-02-14-17-342.jpg',
  'https://i.ibb.co/5WNZ5j7K/Picsart-26-09-01-02-15-48-090.jpg',
  'https://i.ibb.co/d0yx1yYY/Picsart-26-09-01-02-19-50-662.jpg',
  'https://i.ibb.co/RkqF1B5R/Picsart-26-09-01-02-21-05-810.jpg',
  'https://i.ibb.co/Z6T9tKZF/Picsart-26-09-01-02-23-08-473.jpg',
  'https://i.ibb.co/fztXXkC7/Picsart-26-09-01-02-25-55-837.jpg',
  'https://i.ibb.co/Mkj4Z2sx/Picsart-26-09-01-02-28-40-331.jpg',
  'https://i.ibb.co/GGjHdG8/Picsart-26-09-01-02-29-38-372.jpg',
  'https://i.ibb.co/d0V0bcgr/Picsart-26-09-01-02-30-29-176.jpg',
  'https://i.ibb.co/xS9NQK0s/Picsart-26-09-01-02-33-04-025.jpg',
  'https://i.ibb.co/gbD5mhxN/Picsart-26-09-01-02-34-09-849.jpg',
  'https://i.ibb.co/q3JQMGW3/Picsart-26-09-01-02-34-57-648.jpg',
  'https://i.ibb.co/RpnrtJqx/Picsart-26-09-01-02-35-46-594.jpg',
  'https://i.ibb.co/wN800ZfC/Picsart-26-09-01-02-39-18-313.jpg',
  'https://i.ibb.co/xK1fsMCV/Picsart-26-09-01-02-40-06-306.jpg',
  'https://i.ibb.co/nNZPctHN/Picsart-26-09-01-02-41-12-074.jpg',
  'https://i.ibb.co/fG42R3dj/Picsart-26-09-01-02-44-16-836.jpg',
  'https://i.ibb.co/pvPcNgZy/Picsart-26-09-01-02-50-44-035.jpg',
  'https://i.ibb.co/m5XzV9FD/Picsart-26-09-01-02-52-37-553.jpg',
  'https://i.ibb.co/XZK7r6NH/Picsart-26-09-01-02-53-29-142.jpg',
  'https://i.ibb.co/LXWbHD1h/Picsart-26-09-01-02-54-59-424.jpg',
];

interface ProfileSeed {
  name: string;
  ethnicity: string;
  location: string;
}

const PROFILE_SEEDS: ProfileSeed[] = [
  { name: 'Sofia', ethnicity: 'European', location: 'Milan, Italy' },
  { name: 'Emma', ethnicity: 'European', location: 'Paris, France' },
  { name: 'Isabella', ethnicity: 'European', location: 'Barcelona, Spain' },
  { name: 'Charlotte', ethnicity: 'European', location: 'London, UK' },
  { name: 'Amelia', ethnicity: 'European', location: 'Amsterdam, Netherlands' },
  { name: 'Olivia', ethnicity: 'European', location: 'Stockholm, Sweden' },
  { name: 'Mia', ethnicity: 'European', location: 'Berlin, Germany' },
  { name: 'Elena', ethnicity: 'European', location: 'Prague, Czech Republic' },
  { name: 'Natalia', ethnicity: 'European', location: 'Moscow, Russia' },
  { name: 'Freya', ethnicity: 'European', location: 'Copenhagen, Denmark' },
  { name: 'Amara', ethnicity: 'African', location: 'Lagos, Nigeria' },
  { name: 'Zuri', ethnicity: 'African', location: 'Nairobi, Kenya' },
  { name: 'Nia', ethnicity: 'African', location: 'Accra, Ghana' },
  { name: 'Aaliyah', ethnicity: 'African', location: 'Cape Town, South Africa' },
  { name: 'Imani', ethnicity: 'African', location: 'Dar es Salaam, Tanzania' },
  { name: 'Kira', ethnicity: 'African', location: 'Addis Ababa, Ethiopia' },
  { name: 'Nyla', ethnicity: 'African', location: 'Kampala, Uganda' },
  { name: 'Aisha', ethnicity: 'African', location: 'Dakar, Senegal' },
  { name: 'Valentina', ethnicity: 'Latina', location: 'Mexico City, Mexico' },
  { name: 'Camila', ethnicity: 'Latina', location: 'Rio de Janeiro, Brazil' },
  { name: 'Lucia', ethnicity: 'Latina', location: 'Buenos Aires, Argentina' },
  { name: 'Gabriela', ethnicity: 'Latina', location: 'Bogota, Colombia' },
  { name: 'Catalina', ethnicity: 'Latina', location: 'Lima, Peru' },
  { name: 'Alejandra', ethnicity: 'Latina', location: 'Santiago, Chile' },
  { name: 'Miranda', ethnicity: 'Latina', location: 'Havana, Cuba' },
  { name: 'Fernanda', ethnicity: 'Latina', location: 'Cancun, Mexico' },
  { name: 'Yuki', ethnicity: 'Asian', location: 'Tokyo, Japan' },
  { name: 'Mei', ethnicity: 'Asian', location: 'Shanghai, China' },
  { name: 'Sakura', ethnicity: 'Asian', location: 'Osaka, Japan' },
  { name: 'Hana', ethnicity: 'Asian', location: 'Seoul, South Korea' },
  { name: 'Suki', ethnicity: 'Asian', location: 'Bangkok, Thailand' },
  { name: 'Aiko', ethnicity: 'Asian', location: 'Kyoto, Japan' },
  { name: 'Rina', ethnicity: 'Asian', location: 'Manila, Philippines' },
  { name: 'Priya', ethnicity: 'Asian', location: 'Mumbai, India' },
  { name: 'Leila', ethnicity: 'Arabian', location: 'Dubai, UAE' },
  { name: 'Yasmin', ethnicity: 'Arabian', location: 'Istanbul, Turkey' },
  { name: 'Fatima', ethnicity: 'Arabian', location: 'Marrakech, Morocco' },
  { name: 'Noor', ethnicity: 'Arabian', location: 'Beirut, Lebanon' },
  { name: 'Amira', ethnicity: 'Arabian', location: 'Cairo, Egypt' },
  { name: 'Zahra', ethnicity: 'Arabian', location: 'Amman, Jordan' },
  { name: 'Soraya', ethnicity: 'Arabian', location: 'Tehran, Iran' },
  { name: 'Layla', ethnicity: 'Arabian', location: 'Doha, Qatar' },
  { name: 'Rania', ethnicity: 'Arabian', location: 'Muscat, Oman' },
  { name: 'Dalia', ethnicity: 'Arabian', location: 'Tunis, Tunisia' },
  { name: 'Bianca', ethnicity: 'Latina', location: 'Sao Paulo, Brazil' },
  { name: 'Ji-Yeon', ethnicity: 'Asian', location: 'Busan, South Korea' },
  { name: 'Lin', ethnicity: 'Asian', location: 'Singapore' },
  { name: 'Zola', ethnicity: 'African', location: 'Johannesburg, South Africa' },
  { name: 'Sarabi', ethnicity: 'African', location: 'Maputo, Mozambique' },
  { name: 'Natasha', ethnicity: 'European', location: 'Vienna, Austria' },
];

const INTEREST_POOL = [
  'Travel', 'Beach Life', 'Fitness', 'Yoga', 'Swimming', 'Photography',
  'Fashion', 'Dancing', 'Music', 'Cooking', 'Art', 'Movies',
  'Surfing', 'Hiking', 'Coffee', 'Wine Tasting', 'Spa', 'Reading',
  'Nightlife', 'Meditation', 'Skincare', 'Shopping', 'Pilates', 'Tennis',
];

const OCCUPATIONS = [
  'Model', 'Fitness Trainer', 'Photographer', 'Fashion Designer', 'Nurse',
  'Marketing Manager', 'Travel Blogger', 'Yoga Instructor', 'Interior Designer',
  'Event Planner', 'Hair Stylist', 'Dental Hygienist', 'Social Media Manager',
  'Flight Attendant', 'Real Estate Agent', 'Personal Chef', 'Dance Instructor',
];

const BIOS = [
  'Beach lover and sunset chaser. Looking for someone to share adventures with ✨',
  'Fitness enthusiast who loves the ocean. Swipe right if you can keep up 💪',
  'Life is too short for bad vibes. Let\'s make memories together 💕',
  'Adventure seeker with a taste for the finer things in life 🌹',
  'Sun-kissed soul looking for my other half. Are you the one? ☀️',
  'Living life one beach at a time. Come join my journey 🌊',
  'Love traveling, good food, and even better company ✈️',
  'Gym in the morning, beach in the afternoon, you in the evening? 😏',
  'Looking for someone who makes me laugh and gives great hugs 🤗',
  'Free spirit with a wild heart. Let\'s write our own love story 💋',
  'If you can make me smile, you\'ve already won half my heart 😊',
  'Passionate about life, love, and everything in between 🔥',
  'Dreamer by day, dancer by night. Looking for my dance partner 💃',
  'Sweet but adventurous. Come find out which side you\'ll see first 😉',
  'Your next favorite person is just a swipe away ➡️',
  'Coffee addict with a love for sunsets ☕🌅',
  'Bookworm looking for my plot twist 📚',
  'Adventure is out there, and so am I 🌍',
  'Seeking someone to steal my blanket and my heart 🛏️',
  'Professional third wheel looking to upgrade 🚲',
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(arr: T[], count: number, seed: number): T[] {
  return seededShuffle(arr, seed).slice(0, count);
}

export function generateProfiles(): Profile[] {
  faker.seed(42);

  return PROFILE_SEEDS.map((seed, i) => {
    // Use direct image URL from unified array
    const mainPhoto = PROFILE_IMAGES[i];
    const extraPhotos: string[] = [];

    return {
      id: i + 1,
      name: seed.name,
      age: 22 + (i % 14),
      ethnicity: seed.ethnicity,
      location: seed.location,
      bio: BIOS[i % BIOS.length],
      photo: mainPhoto,
      photos: [mainPhoto],
      interests: pickRandom(INTEREST_POOL, 4 + (i % 3), i * 7 + 13),
      occupation: OCCUPATIONS[i % OCCUPATIONS.length],
      education: faker.helpers.arrayElement([
        'University Graduate',
        'College Degree',
        'Master\'s Degree',
        'Self-taught Professional',
      ]),
      verified: true,
      online: true,
      matchScore: 75 + (i % 25),
    };
  });
}

let _cache: Profile[] | null = null;

export function getProfiles(): Profile[] {
  if (!_cache) {
    _cache = generateProfiles();
  }
  return _cache;
}
