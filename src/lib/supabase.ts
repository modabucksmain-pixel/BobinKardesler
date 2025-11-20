import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingConfigMessage =
  'Supabase yapılandırması bulunamadı. Lütfen VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değişkenlerini ayarlayın.';

function createDisabledClient(): SupabaseClient<Database> {
  const emptyResult = Promise.resolve({ data: null, error: new Error(missingConfigMessage) });

  const createQuery = () => {
    const query: any = {
      select: () => emptyResult,
      insert: () => emptyResult,
      update: () => emptyResult,
      delete: () => emptyResult,
      eq: () => query,
      neq: () => query,
      ilike: () => query,
      order: () => query,
      limit: () => query,
      range: () => query,
      single: () => emptyResult,
      maybeSingle: () => emptyResult,
    };

    return query;
  };

  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
      error: null,
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error(missingConfigMessage) as any,
    }),
    signOut: async () => ({ error: null }),
  } as SupabaseClient<Database>['auth'];

  return new Proxy({} as SupabaseClient<Database>, {
    get(_target, prop) {
      if (prop === 'from' || prop === 'rpc') {
        return () => createQuery();
      }

      if (prop === 'auth') {
        return auth;
      }

      return () => emptyResult;
    },
  });
}

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn(missingConfigMessage);
}

export const supabase = supabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : createDisabledClient();
