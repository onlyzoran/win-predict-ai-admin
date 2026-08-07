#!/usr/bin/env node
/**
 * Import leagues.json into SQLite.
 *
 * Usage:
 *   node scripts/import-leagues.mjs
 *   node scripts/import-leagues.mjs ./path/to/leagues.json
 *   LEAGUES_URL=https://... DATABASE_PATH=.data/admin.sqlite node scripts/import-leagues.mjs
 */
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const DEFAULT_URL =
  process.env.LEAGUES_URL ||
  'https://raw.githubusercontent.com/onlyzoran/win-predict-ai-data/main/data/leagues.json'

const dbPathEnv = process.env.DATABASE_PATH || '.data/admin.sqlite'
const dbPath = isAbsolute(dbPathEnv) ? dbPathEnv : resolve(process.cwd(), dbPathEnv)
const localPath = process.argv[2]

async function loadLeagues() {
  if (localPath) {
    const absolute = isAbsolute(localPath) ? localPath : resolve(process.cwd(), localPath)
    const raw = readFileSync(absolute, 'utf8')
    return JSON.parse(raw)
  }

  const res = await fetch(DEFAULT_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch leagues.json (${res.status})`)
  }
  return res.json()
}

function migrate(db) {
  db.exec(`
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
  `)
}

const leagues = await loadLeagues()
if (!Array.isArray(leagues)) {
  throw new Error('leagues.json must be an array')
}

mkdirSync(dirname(dbPath), { recursive: true })
const db = new Database(dbPath)
migrate(db)

const insert = db.prepare(`
  INSERT INTO tournaments
    (id, title, full_title, sport, file, start_date, end_date, end_date_to, popular_priority)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    full_title = excluded.full_title,
    sport = excluded.sport,
    file = excluded.file,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    end_date_to = excluded.end_date_to,
    popular_priority = excluded.popular_priority
`)

const tx = db.transaction((rows) => {
  for (const row of rows) {
    insert.run(
      row.id,
      row.title,
      row.fullTitle ?? '',
      row.sport,
      row.file,
      row.startDate,
      row.endDate,
      row.endDateTo ?? '',
      row.popularPriority,
    )
  }
})

tx(leagues)
db.close()

console.log(`Imported ${leagues.length} tournaments into ${dbPath}`)
