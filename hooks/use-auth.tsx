"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';
import { Database } from '@/types/types_db';

// Types
interface UserDetails {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  credits: number;
  billing_address: any | null;
  created_at: string;
  updated_at: string;
}

interface WalletDetails {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  userDetails: UserDetails | null;
  walletBalance: number;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { supabase } = useSupabase();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Reset auth state
  const resetAuthState = () => {
    setUser(null);
    setSession(null);
    setToken(null);
    setIsAuthenticated(false);
    setUserDetails(null);
    setWalletBalance(0);
  };

  // Fetch user details from database
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user details:', error);
        return;
      }
      
      if (data) {
        setUserDetails(data as UserDetails);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch wallet balance
  const fetchWalletBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching wallet balance:', error);
        return;
      }
      
      if (data) {
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  useEffect(() => {
    // Initialize auth state from Supabase
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get session from Supabase
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setToken(currentSession.access_token);
          setIsAuthenticated(true);
          
          // Fetch user details and wallet balance
          await fetchUserDetails(currentSession.user.id);
          await fetchWalletBalance(currentSession.user.id);
        } else {
          // No session means user is not authenticated
          resetAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        resetAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setToken(newSession?.access_token || null);
        setIsAuthenticated(!!newSession);
        
        if (newSession) {
          await fetchUserDetails(newSession.user.id);
          await fetchWalletBalance(newSession.user.id);
        } else {
          resetAuthState();
        }
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      if (data.user) {
        // Redirect to dashboard on successful sign in
        router.push(`/dashboard/${data.user.id}/main`);
        return { error: null };
      }

      return { error: new Error('No user data returned') };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name || '',
          },
        },
      });
      
      if (error) {
        return { error, data: null };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      resetAuthState();
      router.push('/dashboard/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        setToken(refreshedSession.access_token);
        setIsAuthenticated(true);
        
        await fetchUserDetails(refreshedSession.user.id);
        await fetchWalletBalance(refreshedSession.user.id);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const value = {
    user,
    session,
    token,
    signIn,
    signUp,
    signOut,
    isLoading,
    isAuthenticated,
    refreshSession,
    userDetails,
    walletBalance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};