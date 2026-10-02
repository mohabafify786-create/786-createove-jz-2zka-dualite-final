export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  age: number;
  gender: string;
  interestedIn: string;
  location: string;
  interests: string[];
  photos: string[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
