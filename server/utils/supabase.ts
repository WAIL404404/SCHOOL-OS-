import { createClient } from '@supabase/supabase-js'

const globalSupabase = globalThis as typeof globalThis & {
  __schoolOsSupabase?: ReturnType<typeof createClient> | null
}

export function getSupabaseServerClient() {
  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.supabaseServiceRoleKey) {
    return null
  }

  if (!globalSupabase.__schoolOsSupabase) {
    globalSupabase.__schoolOsSupabase = createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey)
  }

  return globalSupabase.__schoolOsSupabase
}
