import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type Role = 'admin' | 'moderator' | 'user';

interface Profile {
  id: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: Role;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: any | null }>;
  linkGoogleAccount: () => Promise<{ error: any | null }>;
  isGoogleLinked: boolean;
  isGoogleUser: boolean;
  hasRole: (role: Role) => boolean;
  canPostToForum: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isGoogleLinked = Boolean(
    session?.user?.app_metadata?.provider === 'google' ||
      session?.user?.identities?.some((identity: { provider?: string }) => identity?.provider === 'google')
  );

  const isGoogleUser = useMemo(() => session?.user?.app_metadata?.provider === 'google' || isGoogleLinked, [session, isGoogleLinked]);

  const role: Role = profile?.role ?? 'user';

  const hasRole = (required: Role) => {
    if (required === 'user') return true;
    if (required === 'moderator') return role === 'moderator' || role === 'admin';
    return role === 'admin';
  };

  const canPostToForum = Boolean(user && isGoogleUser);

  const hydrateProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profil okunamadı', error);
      return;
    }

    if (data) {
      setProfile({ id: data.id, role: (data.role as Role) ?? 'user' });
    } else {
      setProfile({ id: userId, role: 'user' });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) await hydrateProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await hydrateProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

    const signInWithGoogle = async (redirectPath = '/account') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    return { error };
  };

  const linkGoogleAccount = async () => {
    const { error } = await supabase.auth.linkIdentity({ provider: 'google' });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        linkGoogleAccount,
        isGoogleLinked,
        isGoogleUser,
        hasRole,
        canPostToForum,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
