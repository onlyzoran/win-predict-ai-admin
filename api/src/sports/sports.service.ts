import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import { DatabaseService } from '../database/database.service'
import { CreateSportDto } from './dto/create-sport.dto'
import { UpdateSportDto } from './dto/update-sport.dto'
import { SportDto, SportRow, toSportDto } from './sport.types'

@Injectable()
export class SportsService {
  constructor(private readonly database: DatabaseService) {}

  listEnabled(): SportDto[] {
    const rows = this.database.connection
      .prepare(
        `SELECT * FROM sports WHERE is_enabled = 1 ORDER BY sort_order ASC, slug ASC`,
      )
      .all() as SportRow[]
    return rows.map(toSportDto)
  }

  listAll(): SportDto[] {
    const rows = this.database.connection
      .prepare(`SELECT * FROM sports ORDER BY sort_order ASC, slug ASC`)
      .all() as SportRow[]
    return rows.map(toSportDto)
  }

  create(dto: CreateSportDto): SportDto {
    const db = this.database.connection
    const existing = db
      .prepare(`SELECT id FROM sports WHERE slug = ?`)
      .get(dto.slug) as { id: string } | undefined
    if (existing) {
      throw new ConflictException(`Sport slug "${dto.slug}" already exists`)
    }

    const maxOrder = (
      db.prepare(`SELECT COALESCE(MAX(sort_order), 0) AS max FROM sports`).get() as {
        max: number
      }
    ).max

    const now = Date.now()
    const id = randomBytes(16).toString('hex')
    db.prepare(
      `INSERT INTO sports (id, slug, label, icon_key, sort_order, is_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      dto.slug,
      dto.label.trim(),
      dto.iconKey,
      maxOrder + 10,
      dto.isEnabled === false ? 0 : 1,
      now,
      now,
    )

    return this.getById(id)
  }

  update(id: string, dto: UpdateSportDto): SportDto {
    const current = this.getRow(id)
    const now = Date.now()
    this.database.connection
      .prepare(
        `UPDATE sports
         SET label = ?, icon_key = ?, is_enabled = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(
        dto.label?.trim() ?? current.label,
        dto.iconKey ?? current.icon_key,
        dto.isEnabled === undefined ? current.is_enabled : dto.isEnabled ? 1 : 0,
        now,
        id,
      )
    return this.getById(id)
  }

  remove(id: string): { ok: true } {
    const row = this.getRow(id)
    const inUse = this.countTournamentsUsingSport(row.slug)

    if (inUse > 0) {
      throw new ConflictException(
        `Cannot delete sport "${row.slug}": used by ${inUse} tournament(s)`,
      )
    }

    this.database.connection.prepare(`DELETE FROM sports WHERE id = ?`).run(id)
    return { ok: true }
  }

  private countTournamentsUsingSport(slug: string): number {
    const db = this.database.connection
    const table = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tournaments'`,
      )
      .get() as { name: string } | undefined
    if (!table) return 0
    return (
      db.prepare(`SELECT COUNT(*) AS count FROM tournaments WHERE sport = ?`).get(slug) as {
        count: number
      }
    ).count
  }

  reorder(ids: string[]): { ok: true } {
    const db = this.database.connection
    const existing = db.prepare(`SELECT id FROM sports`).all() as Array<{ id: string }>
    const existingIds = new Set(existing.map((r) => r.id))

    if (ids.length !== existingIds.size || ids.some((id) => !existingIds.has(id))) {
      throw new ConflictException('Reorder payload must include every sport id exactly once')
    }

    const update = db.prepare(
      `UPDATE sports SET sort_order = ?, updated_at = ? WHERE id = ?`,
    )
    const now = Date.now()
    const tx = db.transaction(() => {
      ids.forEach((id, index) => {
        update.run((index + 1) * 10, now, id)
      })
    })
    tx()
    return { ok: true }
  }

  private getRow(id: string): SportRow {
    const row = this.database.connection
      .prepare(`SELECT * FROM sports WHERE id = ?`)
      .get(id) as SportRow | undefined
    if (!row) {
      throw new NotFoundException(`Sport ${id} not found`)
    }
    return row
  }

  private getById(id: string): SportDto {
    return toSportDto(this.getRow(id))
  }
}
