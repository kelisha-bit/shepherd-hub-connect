import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    let isInitialized = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change event:', event, 'Session:', session);
        console.log('AuthProvider: User from session:', session?.user);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: User ID:', session.user.id);
          console.log('AuthProvider: User email:', session.user.email);
          await fetchUserRole(session.user.id);
        } else {
          console.log('AuthProvider: No user in session');
          setRole(null);
        }
        
        if (!isInitialized) {
          isInitialized = true;
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    console.log('AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthProvider: Existing session found:', session);
      console.log('AuthProvider: User from existing session:', session?.user);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('AuthProvider: Existing user ID:', session.user.id);
        console.log('AuthProvider: Existing user email:', session.user.email);
        await fetchUserRole(session.user.id);
      } else {
        console.log('AuthProvider: No user in existing session');
        setRole(null);
      }
      
      if (!isInitialized) {
        isInitialized = true;
        setLoading(false);
      }
    }).catch(error => {
      console.error('AuthProvider: Error getting session:', error);
      if (!isInitialized) {
        isInitialized = true;
        setLoading(false);
      }
    });

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('AuthProvider: Timeout reached, forcing loading to false');
        isInitialized = true;
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log('AuthProvider: Fetching user role for:', userId);
    try {
      // First check if the user exists in the members table
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('AuthProvider: Member data:', memberData, 'Error:', memberError);
      
      // Then check the profiles table for role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      console.log('AuthProvider: Profile data:', data, 'Error:', error);
      
      if (error) {
        console.error('AuthProvider: Error fetching user role:', error);
        setRole(null);
      } else {
        console.log('AuthProvider: User role fetched:', data?.role);
        setRole(data?.role || null);
      }
      
      // If member not found by ID, try by email
      if (memberError) {
        console.log('AuthProvider: Member not found by ID, trying by email...');
        const userEmail = (await supabase.auth.getUser()).data.user?.email;
        
        if (userEmail) {
          const { data: emailMemberData, error: emailMemberError } = await supabase
            .from('members')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle(); // Use maybeSingle to avoid error on no result
          
          console.log('AuthProvider: Member by email:', emailMemberData, 'Error:', emailMemberError);

          if (emailMemberError) {
            console.error('AuthProvider: Error fetching member by email:', emailMemberError);
          }
        }
      }
    } catch (error) {
      console.error('AuthProvider: Exception fetching user role:', error);
      setRole(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    role,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}