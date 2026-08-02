import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as schema from './schema'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL || 'file:./data/admin.sqlite'
  const path = raw.startsWith('file:') ? raw.slice(5) : raw
  return resolve(process.cwd(), path)
}

const dbPath = resolveDbPath()
mkdirSync(dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
