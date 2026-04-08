import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

const stagingUrl = process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL || supabaseUrl
const stagingAnonKey = process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseStaging = createClient(stagingUrl, stagingAnonKey)

/**
 * Returns the correct supabase client based on the environment header or state
 */
export const getSupabaseClient = (env: string = 'production') => {
  return env === 'staging' ? supabaseStaging : supabase
}
