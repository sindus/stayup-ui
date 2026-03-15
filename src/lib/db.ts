import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

const dbUrl = process.env.DATABASE_URL!
const useSSL = dbUrl.includes('sslmode=require') || dbUrl.includes('render.com')

const client = postgres(dbUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ...(useSSL ? { ssl: 'require' } : {}),
})

export const db = drizzle(client, { schema })
