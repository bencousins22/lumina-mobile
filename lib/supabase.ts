/**
 * Supabase Client Configuration
 * 
 * Provides configured Supabase clients for server and client-side usage.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase environment variables with validation
 */
function getSupabaseConfig() {
  // Try multiple environment variable sources
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://ixwkcbistrvayferlwhx.supabase.co'

  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4d2tjYmlzdHJ2YXlmZXJsd2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODMwNDEsImV4cCI6MjA4MzkxOTA0MX0.Ak2HlLHwmdruZVIZJcP6dbs70zoxoP7B8ngjuVLIkZ8'

  const supabaseServiceKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    supabaseAnonKey

  // Debug logging for environment variables
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase Config:', {
      supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      envVars: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_SECRET_KEY: !!process.env.SUPABASE_SECRET_KEY,
      }
    })
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey: supabaseServiceKey || supabaseAnonKey
  }
}

/**
 * Create a Supabase client for client-side usage
 */
export const supabase = (() => {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    // Return a mock client that will show clear error messages
    const { supabaseAnonKey } = getSupabaseConfig()
    return createClient('https://ixwkcbistrvayferlwhx.supabase.co', supabaseAnonKey)
  }
})()

/**
 * Create a Supabase admin client for server-side usage
 */
export const supabaseAdmin = (() => {
  try {
    const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig()
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase admin client:', error)
    // Return a mock admin client
    const { supabaseServiceKey } = getSupabaseConfig()
    return createClient('https://ixwkcbistrvayferlwhx.supabase.co', supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
})()

/**
 * Database types (update these based on your Supabase schema)
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          updated_at?: string
        }
      }
    }
  }
}
