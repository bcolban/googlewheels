import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Public anon key — RLS ile korunduğu için client tarafında saklanması güvenlidir.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Supabase yapılandırılmış mı? (env değişkenleri tanımlı mı) */
export const isSupabaseConfigured = Boolean(url && anonKey)

/** Yapılandırılmışsa client, değilse null. reportsRepo bunu kontrol edip fallback'e düşer. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null
