import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co').trim().replace(/['"]/g, '')
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_key').trim().replace(/['"]/g, '')

const stagingUrl = (process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL || process.env.STAGING_SUPABASE_URL || supabaseUrl).trim().replace(/['"]/g, '')
const stagingAnonKey = (process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY || process.env.STAGING_SUPABASE_ANON_KEY || supabaseAnonKey).trim().replace(/['"]/g, '')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseStaging = createClient(stagingUrl, stagingAnonKey)

/**
 * Returns the correct supabase client based on the environment header or state
 */
export const getSupabaseClient = (env: string = 'production') => {
  return env === 'staging' ? supabaseStaging : supabase
}
