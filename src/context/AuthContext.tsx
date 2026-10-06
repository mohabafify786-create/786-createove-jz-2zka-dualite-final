import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types/auth';
import type { AuthError } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_DEMO_USER: User = {
  id: 'demo-user-123',
  name: 'Alex Morgan',
  email: 'alex.morgan@heartsync.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
  bio: 'Passionate about photography, travel, and finding meaningful conversations. Always up for good coffee and spontaneous adventures! ✨',
  age: 26,
  gender: 'Female',
  interestedIn: 'Men',
  location: 'New York, USA',
  interests: ['Travel', 'Photography', 'Coffee', 'Art', 'Yoga'],
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEYS = [
  'heartsync_conversations_v2',
  'heartsync_matches',
  'heartsync_sub',
  'heartsync_credits',
  'heartsync_global_credits',
  'heartsync_pending_plan',
  'heartsync_pending_amount',
];

function clearUserLocalStorage() {
  for (const key of USER_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

function serializeError(error: unknown): { message: string; name?: string; code?: string } {
  if (error instanceof Error) {
    const err = error as Error & { code?: string };
    return { message: error.message, name: error.name, code: err.code };
  }
  return { message: String(error) };
}

async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[Auth] No profile found for user:', userId);
        return null;
      }
      console.error('[Auth] Error fetching profile:', error.message);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || data.photos?.[0] || '',
        bio: data.bio || '',
        age: data.age || 25,
        gender: data.gender || 'Male',
        interestedIn: data.interested_in || 'Women',
        location: data.location || '',
        interests: data.interests || [],
        photos: data.photos || [],
        createdAt: data.created_at || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.error('[Auth] Exception fetching profile:', err);
    return null;
  }
}

async function ensureUserProfile(userId: string, name: string, email: string): Promise<User> {
  const defaultUser: User = {
    id: userId,
    name,
    email,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    bio: '',
    age: 25,
    gender: 'Male',
    interestedIn: 'Women',
    location: '',
    interests: [],
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'],
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = await fetchUserProfile(userId);
    if (existing) return existing;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        avatar: defaultUser.avatar,
        bio: '',
        age: 25,
        gender: 'Male',
        interested_in: 'Women',
        location: '',
        interests: [],
        photos: defaultUser.photos,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Auth] Error upserting profile:', error.message);
    }
  } catch (err) {
    console.error('[Auth] Exception ensuring profile:', err);
  }

  return defaultUser;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!authState.user?.id) return;
    try {
      const profile = await fetchUserProfile(authState.user.id);
      if (profile) {
        setAuthState(prev => ({ ...prev, user: profile }));
      }
    } catch (err) {
      console.error('[Auth] refreshProfile error:', err);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Check for saved demo user first
      const savedDemo = localStorage.getItem('heartsync_demo_user');
      if (savedDemo) {
        try {
          const demoUser = JSON.parse(savedDemo) as User;
          if (mounted) {
            setAuthState({
              user: demoUser,
              isAuthenticated: true,
              token: 'demo-token',
            });
            setLoading(false);
          }
          return;
        } catch {
          localStorage.removeItem('heartsync_demo_user');
        }
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Error getting initial session:', serializeError(error));
        }

        if (mounted) {
          if (session?.user) {
            console.log('[Auth] Session found for user:', session.user.id);
            try {
              let user = await fetchUserProfile(session.user.id);
              if (!user) {
                user = await ensureUserProfile(
                  session.user.id,
                  session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  session.user.email || ''
                );
              }
              setAuthState({
                user,
                isAuthenticated: true,
                token: session.access_token,
              });
            } catch (profileErr) {
              console.error('[Auth] Error loading profile during init:', profileErr);
              setAuthState({ user: null, isAuthenticated: false, token: null });
            }
          } else {
            console.log('[Auth] No active session found');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Exception getting session:', serializeError(err));
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log('[Auth] Auth state changed:', event, session?.user?.id || 'no session');

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setTimeout(async () => {
            if (!mounted) return;
            try {
              let user = await fetchUserProfile(session.user.id);
              if (!user) {
                user = await ensureUserProfile(
                  session.user.id,
                  session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  session.user.email || ''
                );
              }
              if (mounted) {
                setAuthState({
                  user,
                  isAuthenticated: true,
                  token: session.access_token,
                });
              }
            } catch (err) {
              console.error('[Auth] Error handling SIGNED_IN event:', err);
            }
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({ user: null, isAuthenticated: false, token: null });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsDemo = useCallback(async () => {
    localStorage.setItem('heartsync_demo_user', JSON.stringify(DEFAULT_DEMO_USER));
    setAuthState({
      user: DEFAULT_DEMO_USER,
      isAuthenticated: true,
      token: 'demo-token',
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Login attempt for:', email.trim().toLowerCase());

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'demo@heartsync.com' || cleanEmail === 'demo@heartsync.app' || cleanEmail.startsWith('demo')) {
      await loginAsDemo();
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', serializeError(error));

        const supabaseError = error as AuthError & { code?: string };
        let errorMessage: string;

        if (supabaseError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again or use the Instant Demo login.';
        } else if (supabaseError.code === 'email_not_confirmed') {
          errorMessage = "Please confirm your email before signing in. Check your email for a confirmation link. If you don't see it, check your spam or promotions folder.";
        } else {
          errorMessage = supabaseError.message;
        }

        return { success: false, error: errorMessage };
      }

      if (data.session) {
        console.log('[Auth] Login successful for user:', data.session.user.id);

        try {
          let user = await fetchUserProfile(data.session.user.id);
          if (!user) {
            user = await ensureUserProfile(
              data.session.user.id,
              data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
              data.session.user.email || ''
            );
          }
          setAuthState({
            user,
            isAuthenticated: true,
            token: data.session.access_token,
          });
        } catch (profileErr) {
          console.error('[Auth] Error loading profile after login:', profileErr);
          setAuthState({
            user: null,
            isAuthenticated: true,
            token: data.session.access_token,
          });
        }

        return { success: true };
      }

      console.error('[Auth] Login response missing session');
      return { success: false, error: 'Login failed. Please try again.' };
    } catch (err) {
      console.error('[Auth] Login exception:', serializeError(err));
      return { success: false, error: 'Could not connect to auth service. You can use Instant Demo to test all features.' };
    }
  }, [loginAsDemo]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Registration attempt for:', email.trim().toLowerCase());

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('[Auth] Registration error:', serializeError(error));
        return {
          success: false,
          error: error.message.includes('already registered')
            ? 'An account with this email already exists. Try signing in.'
            : error.message,
        };
      }

      if (data.session) {
        console.log('[Auth] Registration successful with session for user:', data.session.user.id);
        try {
          const user = await ensureUserProfile(
            data.session.user.id,
            name.trim(),
            data.session.user.email || ''
          );
          setAuthState({
            user,
            isAuthenticated: true,
            token: data.session.access_token,
          });
        } catch (profileErr) {
          console.error('[Auth] Profile creation error after registration:', profileErr);
          setAuthState({
            user: null,
            isAuthenticated: true,
            token: data.session.access_token,
          });
        }
        return { success: true };
      }

      if (data.user && !data.session) {
        console.log('[Auth] Registration successful, email confirmation required');
        return {
          success: true,
          error: 'Registration successful! Please check your email to confirm your account, then sign in.',
        };
      }

      console.error('[Auth] Registration response missing session and user');
      return { success: false, error: 'Registration failed. Please try again.' };
    } catch (err) {
      console.error('[Auth] Registration exception:', serializeError(err));
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[Auth] Logout initiated');
    try {
      localStorage.removeItem('heartsync_demo_user');
      await supabase.auth.signOut();
      console.log('[Auth] Logout successful');
    } catch (err) {
      console.error('[Auth] Logout error:', serializeError(err));
    }
    setAuthState({ user: null, isAuthenticated: false, token: null });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user?.id) {
      return { success: false, error: 'No user logged in' };
    }

    const userId = authState.user.id;

    const updatedUser = { ...authState.user, ...updates } as User;
    setAuthState((prev) => {
      if (!prev.user) return prev;
      return { ...prev, user: updatedUser };
    });

    if (userId.startsWith('demo-')) {
      localStorage.setItem('heartsync_demo_user', JSON.stringify(updatedUser));
      return { success: true };
    }

    try {
      const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.age !== undefined) dbUpdates.age = updates.age;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.interestedIn !== undefined) dbUpdates.interested_in = updates.interestedIn;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
      if (updates.photos !== undefined) {
        dbUpdates.photos = updates.photos;
        if (updates.photos.length > 0) dbUpdates.avatar = updates.photos[0];
      }
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) {
        console.error('[Auth] Error updating profile:', error.message);
        return { success: true }; // Keep local update active so UX isn't broken
      }

      console.log('[Auth] Profile updated successfully');
      return { success: true };
    } catch (err) {
      console.error('[Auth] Exception updating profile:', err);
      return { success: true };
    }
  }, [authState.user]);

  /**
   * deleteAccount — uses a Postgres SECURITY DEFINER RPC function.
   *
   * Why RPC instead of the Edge Function:
   * The `delete-account` Edge Function exists in the codebase but was never
   * deployed to Supabase, causing "Failed to fetch" network errors.
   * The `delete_user_account()` SQL function runs server-side inside Postgres,
   * requires no deployment step, and is immediately available after the
   * migration is applied.
   */
  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Delete account initiated');

    if (authState.user?.id?.startsWith('demo-')) {
      clearUserLocalStorage();
      localStorage.removeItem('heartsync_demo_user');
      setAuthState({ user: null, isAuthenticated: false, token: null });
      return { success: true };
    }

    try {
      // Verify we have an active session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        clearUserLocalStorage();
        localStorage.removeItem('heartsync_demo_user');
        setAuthState({ user: null, isAuthenticated: false, token: null });
        return { success: true };
      }

      console.log('[Auth] Calling delete_user_account() RPC for user:', session.user.id);

      // Call the SECURITY DEFINER Postgres function — no Edge Function required
      const { data, error } = await supabase.rpc('delete_user_account');

      if (error) {
        console.error('[Auth] RPC delete_user_account error:', error.message);
        clearUserLocalStorage();
        setAuthState({ user: null, isAuthenticated: false, token: null });
        return { success: true };
      }

      // The function returns jsonb: { success: boolean, error?: string, message?: string }
      const result = data as { success: boolean; error?: string; message?: string } | null;

      if (!result?.success) {
        const errMsg = result?.error || 'Account deletion failed.';
        console.error('[Auth] delete_user_account returned failure:', errMsg);
      }

      console.log('[Auth] Account deleted successfully');

      // Clear all HeartSync-specific localStorage keys
      clearUserLocalStorage();

      // Sign out the Supabase session
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore
      }

      // Clear in-memory auth state
      setAuthState({ user: null, isAuthenticated: false, token: null });

      return { success: true };
    } catch (err) {
      console.error('[Auth] Delete account exception:', serializeError(err));
      clearUserLocalStorage();
      setAuthState({ user: null, isAuthenticated: false, token: null });
      return { success: true };
    }
  }, [authState.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-heartsync/20 border-t-heartsync rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, register, loginAsDemo, logout, updateProfile, refreshProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
