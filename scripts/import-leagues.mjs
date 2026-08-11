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

function tableColumns(db) {
  const rows = db.prepare(`PRAGMA table_info(tournaments)`).all()
  return new Set(rows.map((row) => row.name))
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      full_title TEXT NOT NULL DEFAULT '',
      sport TEXT NOT NULL,
      layout TEXT NOT NULL DEFAULT 'legacy',
      file TEXT NOT NULL DEFAULT '',
      contest_path TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      end_date_to TEXT NOT NULL DEFAULT '',
      popular_priority INTEGER NOT NULL DEFAULT 0
    );
  `)

  const columns = tableColumns(db)
  if (!columns.has('layout')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN layout TEXT NOT NULL DEFAULT 'legacy'`)
  }
  if (!columns.has('contest_path')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN contest_path TEXT NOT NULL DEFAULT ''`)
  }
}

function normalizeRow(row) {
  const layout = row.layout === 'contests' ? 'contests' : 'legacy'
  if (layout === 'contests') {
    const contestPath = String(row.contestPath || '').trim()
    if (!contestPath) {
      throw new Error(`League "${row.id}" has layout=contests but missing contestPath`)
    }
    return {
      id: row.id,
      title: row.title,
      fullTitle: row.fullTitle ?? '',
      sport: row.sport,
      layout,
      file: '',
      contestPath,
      startDate: row.startDate,
      endDate: row.endDate,
      endDateTo: row.endDateTo ?? '',
      popularPriority: row.popularPriority,
    }
  }

  const file = String(row.file || '').trim()
  if (!file) {
    throw new Error(`League "${row.id}" is legacy layout but missing file`)
  }
  return {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle ?? '',
    sport: row.sport,
    layout,
    file,
    contestPath: '',
    startDate: row.startDate,
    endDate: row.endDate,
    endDateTo: row.endDateTo ?? '',
    popularPriority: row.popularPriority,
  }
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
    (id, title, full_title, sport, layout, file, contest_path, start_date, end_date, end_date_to, popular_priority)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    full_title = excluded.full_title,
    sport = excluded.sport,
    layout = excluded.layout,
    file = excluded.file,
    contest_path = excluded.contest_path,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    end_date_to = excluded.end_date_to,
    popular_priority = excluded.popular_priority
`)

const tx = db.transaction((rows) => {
  for (const raw of rows) {
    const row = normalizeRow(raw)
    insert.run(
      row.id,
      row.title,
      row.fullTitle,
      row.sport,
      row.layout,
      row.file,
      row.contestPath,
      row.startDate,
      row.endDate,
      row.endDateTo,
      row.popularPriority,
    )
  }
})

tx(leagues)
db.close()

const contests = leagues.filter((row) => row.layout === 'contests').length
console.log(
  `Imported ${leagues.length} tournaments (${contests} contests, ${leagues.length - contests} legacy) into ${dbPath}`,
)
