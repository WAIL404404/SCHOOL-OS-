export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  return {
    provide: {
      supabase: config.public.supabaseUrl && config.public.supabaseAnonKey
        ? {
            url: config.public.supabaseUrl,
            enabled: true
          }
        : null
    }
  }
})
