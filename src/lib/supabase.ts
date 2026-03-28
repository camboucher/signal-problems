import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const mockMode = import.meta.env.VITE_MOCK_MODE === 'true'
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLW1vY2sifQ.mock'

if (!mockMode && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
