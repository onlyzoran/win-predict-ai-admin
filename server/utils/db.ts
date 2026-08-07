import { mkdirSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import Database from 'better-sqlite3'

let db: Database.Database | null = null

function resolveDbPath(configured: string) {
  if (isAbsolute(configured)) return configured
  return resolve(process.cwd(), configured)
}

function resolveConfigPath() {
  const config = useRuntimeConfig()
  return (
    process.env.DATABASE_PATH
    || process.env.NUXT_DATABASE_PATH
    || config.databasePath
    || '.data/admin.sqlite'
  )
}

export function useDb() {
  if (db) return db

  const path = resolveDbPath(resolveConfigPath())
  mkdirSync(dirname(path), { recursive: true })

  db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      full_title TEXT NOT NULL DEFAULT '',
      sport TEXT NOT NULL,
      file TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      end_date_to TEXT NOT NULL DEFAULT '',
      popular_priority INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS magic_links (
      token_hash TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tournaments_priority ON tournaments(popular_priority);
    CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `)
}
