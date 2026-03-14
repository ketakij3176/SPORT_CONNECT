import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const emptyPromise = Promise.resolve({ data: [], error: null });
const emptyInsert = Promise.resolve({ error: null });

const noopSupabase = {
  from: () => ({
    select: () => ({ order: () => ({ limit: () => emptyPromise }), then: (fn) => emptyPromise.then(fn) }),
    insert: () => ({ then: (fn) => emptyInsert.then(fn) }),
  }),
};

export const isSupabaseConfigured = isConfigured;
export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : noopSupabase;

