import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Singleton browser client
let client: ReturnType<typeof createClient> | null = null

export function createBrowserClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}

// Server-side client authenticated with a user JWT (for API routes)
export function createServerClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  })
}
