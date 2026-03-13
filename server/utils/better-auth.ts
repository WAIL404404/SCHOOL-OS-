import { betterAuth } from 'better-auth'
import { memoryAdapter, type MemoryDB } from 'better-auth/adapters/memory'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins/organization'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const authMemoryDb: MemoryDB = {
  user: [],
  session: [],
  account: [],
  verification: [],
  organization: [],
  member: [],
  invitation: []
}

const authGlobals = globalThis as typeof globalThis & {
  __schoolOsBetterAuth?: unknown
  __schoolOsBetterAuthSql?: ReturnType<typeof postgres>
  __schoolOsBetterAuthDb?: ReturnType<typeof drizzle>
}

function getAuthDatabaseAdapter() {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    return memoryAdapter(authMemoryDb)
  }

  if (!authGlobals.__schoolOsBetterAuthSql) {
    authGlobals.__schoolOsBetterAuthSql = postgres(config.databaseUrl, { prepare: false })
  }

  if (!authGlobals.__schoolOsBetterAuthDb) {
    authGlobals.__schoolOsBetterAuthDb = drizzle(authGlobals.__schoolOsBetterAuthSql)
  }

  return drizzleAdapter(authGlobals.__schoolOsBetterAuthDb, { provider: 'pg' })
}

export function getBetterAuth() {
  if (authGlobals.__schoolOsBetterAuth) {
    return authGlobals.__schoolOsBetterAuth as ReturnType<typeof betterAuth>
  }

  const config = useRuntimeConfig()
  const auth = betterAuth({
    baseURL: config.public.appBaseUrl,
    basePath: '/api/auth',
    secret: config.betterAuthSecret || 'dev-secret-for-local-demo-only-change-me',
    database: getAuthDatabaseAdapter(),
    emailAndPassword: { enabled: true },
    rateLimit: { enabled: false },
    trustedOrigins: [config.public.appBaseUrl],
    plugins: [organization()]
  })

  authGlobals.__schoolOsBetterAuth = auth
  return auth
}
