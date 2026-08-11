import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'
import type { LeagueJson, Sport, Tournament, TournamentLayout } from '../../shared/tournament'
import { fromLeagueJson, normalizeLayout, slugify, toLeagueJson } from '../../shared/tournament'
import { useDb } from './db'

interface TournamentRow {
  id: string
  title: string
  full_title: string
  sport: string
  layout: string
  file: string
  contest_path: string
  start_date: string
  end_date: string
  end_date_to: string
  popular_priority: number
}

const TOURNAMENT_SELECT = `SELECT id, title, full_title, sport, layout, file, contest_path,
       start_date, end_date, end_date_to, popular_priority
       FROM tournaments`

function rowToTournament(row: TournamentRow): Tournament {
  return fromLeagueJson({
    id: row.id,
    title: row.title,
    fullTitle: row.full_title,
    sport: row.sport as Sport,
    layout: normalizeLayout(row.layout),
    file: row.file || undefined,
    contestPath: row.contest_path || undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    endDateTo: row.end_date_to,
    popularPriority: row.popular_priority,
  })
}

function storagePaths(layout: TournamentLayout, file: string | null | undefined, contestPath: string | null | undefined) {
  if (layout === 'contests') {
    return { file: '', contestPath: contestPath?.trim() || '' }
  }
  return { file: file?.trim() || '', contestPath: '' }
}

function validateDates(startDate: string, endDate: string, endDateTo: string | null) {
  if (endDate < startDate) {
    throw createError({ statusCode: 400, statusMessage: 'End date cannot be earlier than start date' })
  }
  if (endDateTo && endDateTo < endDate) {
    throw createError({ statusCode: 400, statusMessage: '“End by” cannot be earlier than the end date' })
  }
}

function validateLayoutPaths(layout: TournamentLayout, file: string | null, contestPath: string | null) {
  if (layout === 'contests') {
    if (!contestPath?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'contestPath is required for contests layout' })
    }
  }
  else if (!file?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'file is required for legacy layout' })
  }
}

export function listTournaments(): Tournament[] {
  const rows = useDb()
    .prepare(`${TOURNAMENT_SELECT} ORDER BY popular_priority ASC, title ASC`)
    .all() as TournamentRow[]
  return rows.map(rowToTournament)
}

export function getTournamentById(id: string): Tournament {
  const row = useDb()
    .prepare(`${TOURNAMENT_SELECT} WHERE id = ?`)
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

  const layout = payload.layout
  const paths = storagePaths(layout, payload.file, payload.contestPath)
  const created: Tournament = {
    id,
    title: payload.title,
    fullTitle: payload.fullTitle ?? '',
    sport: payload.sport,
    layout,
    file: layout === 'legacy' ? paths.file : null,
    contestPath: layout === 'contests' ? paths.contestPath : null,
    startDate: payload.startDate,
    endDate: payload.endDate,
    endDateTo: payload.endDateTo ?? null,
    popularPriority,
  }

  validateLayoutPaths(created.layout, created.file, created.contestPath)
  validateDates(created.startDate, created.endDate, created.endDateTo)
  const json = toLeagueJson(created)

  db.prepare(
    `INSERT INTO tournaments
      (id, title, full_title, sport, layout, file, contest_path, start_date, end_date, end_date_to, popular_priority)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    json.id,
    json.title,
    json.fullTitle ?? '',
    json.sport,
    created.layout,
    paths.file,
    paths.contestPath,
    json.startDate,
    json.endDate,
    json.endDateTo,
    json.popularPriority,
  )

  return created
}

export function updateTournament(id: string, payload: TournamentUpdateInput): Tournament {
  const current = getTournamentById(id)
  const layout = payload.layout ?? current.layout
  const nextFile = payload.file !== undefined ? payload.file : current.file
  const nextContestPath = payload.contestPath !== undefined ? payload.contestPath : current.contestPath
  const paths = storagePaths(layout, nextFile, nextContestPath)

  const updated: Tournament = {
    id,
    title: payload.title ?? current.title,
    fullTitle: payload.fullTitle ?? current.fullTitle,
    sport: payload.sport ?? current.sport,
    layout,
    file: layout === 'legacy' ? paths.file : null,
    contestPath: layout === 'contests' ? paths.contestPath : null,
    startDate: payload.startDate ?? current.startDate,
    endDate: payload.endDate ?? current.endDate,
    endDateTo: payload.endDateTo === undefined ? current.endDateTo : payload.endDateTo,
    popularPriority: payload.popularPriority ?? current.popularPriority,
  }

  validateLayoutPaths(updated.layout, updated.file, updated.contestPath)
  validateDates(updated.startDate, updated.endDate, updated.endDateTo)
  const json = toLeagueJson(updated)

  useDb()
    .prepare(
      `UPDATE tournaments SET
        title = ?, full_title = ?, sport = ?, layout = ?, file = ?, contest_path = ?,
        start_date = ?, end_date = ?, end_date_to = ?, popular_priority = ?
       WHERE id = ?`,
    )
    .run(
      json.title,
      json.fullTitle ?? '',
      json.sport,
      updated.layout,
      paths.file,
      paths.contestPath,
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
      popular_priority = excluded.popular_priority`,
  )

  const tx = db.transaction((rows: LeagueJson[]) => {
    for (const row of rows) {
      const tournament = fromLeagueJson(row)
      const paths = storagePaths(tournament.layout, tournament.file, tournament.contestPath)
      insert.run(
        tournament.id,
        tournament.title,
        tournament.fullTitle ?? '',
        tournament.sport,
        tournament.layout,
        paths.file,
        paths.contestPath,
        tournament.startDate,
        tournament.endDate,
        tournament.endDateTo ?? '',
        tournament.popularPriority,
      )
    }
  })

  tx(leagues)
  return leagues.length
}
