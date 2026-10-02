export interface Profile {
  id: number;
  name: string;
  age: number;
  ethnicity: string;
  location: string;
  bio: string;
  photo: string;
  photos: string[];
  interests: string[];
  occupation: string;
  education: string;
  verified: boolean;
  online: boolean;
  matchScore: number;
}
