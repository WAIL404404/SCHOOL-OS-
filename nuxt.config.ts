export default defineNuxtConfig({
  compatibilityDate: '2026-03-11',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', 'motion-v/nuxt'],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },
  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      appBaseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      inactivityTimeoutMs: 15 * 60 * 1000
    }
  },
  typescript: {
    strict: true,
    typeCheck: false
  },
  experimental: {
    typedPages: false
  },
  vite: {
    build: {
      commonjsOptions: {
        include: []
      }
    }
  },
  future: {
    compatibilityVersion: 4
  }
})
