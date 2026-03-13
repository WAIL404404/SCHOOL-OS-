import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '~/server/db/schema'

const globalDb = globalThis as typeof globalThis & {
  __schoolOsSql?: ReturnType<typeof postgres>
  __schoolOsDb?: any
}

export function getDrizzleDb() {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    return null
  }

  if (!globalDb.__schoolOsSql) {
    globalDb.__schoolOsSql = postgres(config.databaseUrl, { prepare: false })
  }

  if (!globalDb.__schoolOsDb) {
    globalDb.__schoolOsDb = drizzle(globalDb.__schoolOsSql, { schema })
  }

  return globalDb.__schoolOsDb
}
