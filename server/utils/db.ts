import { mkdirSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import Database from 'better-sqlite3'

let db: Database.Database | null = null
let bootstrapped = false

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

function parseBootstrapEmails(): string[] {
  const raw = String(
    process.env.ADMIN_EMAILS
    || process.env.NUXT_ADMIN_EMAILS
    || useRuntimeConfig().adminEmails
    || '',
  )
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.includes('@'))
}

/** Seed missing emails from ADMIN_EMAILS; never reactivates deactivated users. */
function bootstrapAdmins(database: Database.Database) {
  if (bootstrapped) return
  bootstrapped = true

  const insert = database.prepare(
    `INSERT OR IGNORE INTO users (id, email, role, is_active, created_at, last_login_at)
     VALUES (?, ?, 'admin', 1, ?, NULL)`,
  )
  const now = Date.now()
  for (const email of parseBootstrapEmails()) {
    insert.run(randomBytes(16).toString('hex'), email, now)
  }
}

export function useDb() {
  if (db) return db

  const path = resolveDbPath(resolveConfigPath())
  mkdirSync(dirname(path), { recursive: true })

  db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  bootstrapAdmins(db)
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

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      last_login_at INTEGER
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
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `)
}
