import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { tournaments } from './schema'
import seedData from './seed-data.json'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL || 'file:./data/admin.sqlite'
  const path = raw.startsWith('file:') ? raw.slice(5) : raw
  return resolve(process.cwd(), path)
}

async function seed() {
  const dbPath = resolveDbPath()
  mkdirSync(dirname(dbPath), { recursive: true })

  const sqlite = new Database(dbPath)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      sport TEXT NOT NULL,
      file TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      end_date_to TEXT,
      popular_priority INTEGER DEFAULT 0 NOT NULL
    );
  `)

  const db = drizzle(sqlite)

  const rows = (seedData as Array<{
    id: string
    title: string
    sport: string
    file: string
    startDate: string
    endDate: string
    endDateTo?: string
    popularPriority: number
  }>).map((row) => ({
    id: row.id,
    title: row.title,
    sport: row.sport as typeof tournaments.$inferInsert.sport,
    file: row.file,
    startDate: row.startDate,
    endDate: row.endDate,
    endDateTo: row.endDateTo && row.endDateTo.trim() !== '' ? row.endDateTo : null,
    popularPriority: row.popularPriority,
  }))

  await db.delete(tournaments)
  await db.insert(tournaments).values(rows)

  console.log(`Seeded ${rows.length} tournaments into ${dbPath}`)
  sqlite.close()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
