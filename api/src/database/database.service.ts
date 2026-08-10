import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { mkdirSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import Database from 'better-sqlite3'

const SEED_SPORTS: Array<{ slug: string; label: string; iconKey: string; sortOrder: number }> = [
  { slug: 'football', label: 'Football', iconKey: 'football', sortOrder: 10 },
  { slug: 'basketball', label: 'Basketball', iconKey: 'basketball', sortOrder: 20 },
  { slug: 'americanFootball', label: 'American Football', iconKey: 'americanFootball', sortOrder: 30 },
  { slug: 'hockey', label: 'Hockey', iconKey: 'hockey', sortOrder: 40 },
  { slug: 'baseball', label: 'Baseball', iconKey: 'baseball', sortOrder: 50 },
  { slug: 'motorsport', label: 'Motorsport', iconKey: 'motorsport', sortOrder: 60 },
  { slug: 'golf', label: 'Golf', iconKey: 'golf', sortOrder: 70 },
  { slug: 'politics', label: 'Politics', iconKey: 'politics', sortOrder: 80 },
]

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db!: Database.Database

  onModuleInit() {
    const path = this.resolveDbPath()
    mkdirSync(dirname(path), { recursive: true })
    this.db = new Database(path)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.migrate()
    this.seedSports()
  }

  onModuleDestroy() {
    this.db?.close()
  }

  get connection(): Database.Database {
    return this.db
  }

  private resolveDbPath() {
    const configured =
      process.env.DATABASE_PATH
      || process.env.NUXT_DATABASE_PATH
      || '.data/admin.sqlite'
    if (isAbsolute(configured)) return configured
    // Resolve relative to repo root (parent of api/)
    return resolve(process.cwd().endsWith('/api') || process.cwd().endsWith('\\api')
      ? resolve(process.cwd(), '..')
      : process.cwd(), configured)
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sports (
        id TEXT PRIMARY KEY NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        icon_key TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_enabled INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sports_sort ON sports(sort_order);
      CREATE INDEX IF NOT EXISTS idx_sports_enabled ON sports(is_enabled);
    `)
  }

  private seedSports() {
    const count = (
      this.db.prepare(`SELECT COUNT(*) AS count FROM sports`).get() as { count: number }
    ).count
    if (count > 0) return

    const now = Date.now()
    const insert = this.db.prepare(
      `INSERT INTO sports (id, slug, label, icon_key, sort_order, is_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    const tx = this.db.transaction(() => {
      for (const sport of SEED_SPORTS) {
        insert.run(
          randomBytes(16).toString('hex'),
          sport.slug,
          sport.label,
          sport.iconKey,
          sport.sortOrder,
          now,
          now,
        )
      }
    })
    tx()
  }
}
