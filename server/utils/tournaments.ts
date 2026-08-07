import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'
import type { LeagueJson, Sport, Tournament } from '../../shared/tournament'
import { fromLeagueJson, slugify, toLeagueJson } from '../../shared/tournament'
import { useDb } from './db'

interface TournamentRow {
  id: string
  title: string
  full_title: string
  sport: string
  file: string
  start_date: string
  end_date: string
  end_date_to: string
  popular_priority: number
}

function rowToTournament(row: TournamentRow): Tournament {
  return fromLeagueJson({
    id: row.id,
    title: row.title,
    fullTitle: row.full_title,
    sport: row.sport as Sport,
    file: row.file,
    startDate: row.start_date,
    endDate: row.end_date,
    endDateTo: row.end_date_to,
    popularPriority: row.popular_priority,
  })
}

function validateDates(startDate: string, endDate: string, endDateTo: string | null) {
  if (endDate < startDate) {
    throw createError({ statusCode: 400, statusMessage: 'End date cannot be earlier than start date' })
  }
  if (endDateTo && endDateTo < endDate) {
    throw createError({ statusCode: 400, statusMessage: '“End by” cannot be earlier than the end date' })
  }
}

export function listTournaments(): Tournament[] {
  const rows = useDb()
    .prepare(
      `SELECT id, title, full_title, sport, file, start_date, end_date, end_date_to, popular_priority
       FROM tournaments
       ORDER BY popular_priority ASC, title ASC`,
    )
    .all() as TournamentRow[]
  return rows.map(rowToTournament)
}

export function getTournamentById(id: string): Tournament {
  const row = useDb()
    .prepare(
      `SELECT id, title, full_title, sport, file, start_date, end_date, end_date_to, popular_priority
       FROM tournaments WHERE id = ?`,
    )
    .get(id) as TournamentRow | undefined

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })
  }
  return rowToTournament(row)
}

export function createTournament(payload: TournamentCreateInput): Tournament {
  const db = useDb()
  const id = payload.id?.trim() || slugify(payload.title)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Could not generate id' })
  }

  const existing = db.prepare(`SELECT id FROM tournaments WHERE id = ?`).get(id)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Tournament with this id already exists' })
  }

  let popularPriority = payload.popularPriority
  if (popularPriority == null) {
    const maxRow = db.prepare(`SELECT MAX(popular_priority) AS max FROM tournaments`).get() as {
      max: number | null
    }
    popularPriority = (maxRow.max ?? 0) + 10
  }

  const created: Tournament = {
    id,
    title: payload.title,
    fullTitle: payload.fullTitle ?? '',
    sport: payload.sport,
    file: payload.file,
    startDate: payload.startDate,
    endDate: payload.endDate,
    endDateTo: payload.endDateTo ?? null,
    popularPriority,
  }

  validateDates(created.startDate, created.endDate, created.endDateTo)
  const json = toLeagueJson(created)

  db.prepare(
    `INSERT INTO tournaments
      (id, title, full_title, sport, file, start_date, end_date, end_date_to, popular_priority)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    json.id,
    json.title,
    json.fullTitle ?? '',
    json.sport,
    json.file,
    json.startDate,
    json.endDate,
    json.endDateTo,
    json.popularPriority,
  )

  return created
}

export function updateTournament(id: string, payload: TournamentUpdateInput): Tournament {
  const current = getTournamentById(id)
  const updated: Tournament = {
    id,
    title: payload.title ?? current.title,
    fullTitle: payload.fullTitle ?? current.fullTitle,
    sport: payload.sport ?? current.sport,
    file: payload.file ?? current.file,
    startDate: payload.startDate ?? current.startDate,
    endDate: payload.endDate ?? current.endDate,
    endDateTo: payload.endDateTo === undefined ? current.endDateTo : payload.endDateTo,
    popularPriority: payload.popularPriority ?? current.popularPriority,
  }

  validateDates(updated.startDate, updated.endDate, updated.endDateTo)
  const json = toLeagueJson(updated)

  useDb()
    .prepare(
      `UPDATE tournaments SET
        title = ?, full_title = ?, sport = ?, file = ?,
        start_date = ?, end_date = ?, end_date_to = ?, popular_priority = ?
       WHERE id = ?`,
    )
    .run(
      json.title,
      json.fullTitle ?? '',
      json.sport,
      json.file,
      json.startDate,
      json.endDate,
      json.endDateTo,
      json.popularPriority,
      id,
    )

  return updated
}

export function deleteTournament(id: string) {
  const result = useDb().prepare(`DELETE FROM tournaments WHERE id = ?`).run(id)
  if (result.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })
  }
}

export function reorderTournaments(ids: string[]) {
  const db = useDb()
  const update = db.prepare(`UPDATE tournaments SET popular_priority = ? WHERE id = ?`)
  const tx = db.transaction((orderedIds: string[]) => {
    for (const [index, id] of orderedIds.entries()) {
      update.run((index + 1) * 10, id)
    }
  })
  tx(ids)
}

export function importLeagues(leagues: LeagueJson[]) {
  const db = useDb()
  const insert = db.prepare(
    `INSERT INTO tournaments
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
      popular_priority = excluded.popular_priority`,
  )

  const tx = db.transaction((rows: LeagueJson[]) => {
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
  return leagues.length
}
