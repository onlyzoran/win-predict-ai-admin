/** Known default sports (seeded into Nest sports table). Prefer API for live list. */
export const SPORT_VALUES = [
  'football',
  'basketball',
  'americanFootball',
  'golf',
  'baseball',
  'politics',
  'hockey',
  'motorsport',
] as const

/** Sport slug stored on tournaments (dynamic catalog via Nest). */
export type Sport = string

/**
 * Data layout in win-predict-ai-data.
 * - legacy: `data/{file}` + `data/history/{id}/`
 * - contests: `data/{contestPath}/` (facts + predictions)
 */
export const TOURNAMENT_LAYOUTS = ['legacy', 'contests'] as const
export type TournamentLayout = (typeof TOURNAMENT_LAYOUTS)[number]

/** App-facing tournament (null endDateTo for forms) */
export interface Tournament {
  id: string
  title: string
  fullTitle: string
  sport: Sport
  layout: TournamentLayout
  /** Legacy prediction JSON filename, e.g. `ucl-26-27.json`. Null for contests. */
  file: string | null
  /** Contests folder under data/, e.g. `contests/rpl-26-27`. Null for legacy. */
  contestPath: string | null
  startDate: string
  endDate: string
  endDateTo: string | null
  popularPriority: number
}

/** Shape stored in SQLite / leagues.json import/export */
export interface LeagueJson {
  id: string
  title: string
  fullTitle?: string
  sport: Sport
  startDate: string
  endDate: string
  endDateTo: string
  popularPriority: number
  /** Present on legacy entries (omitted for contests). */
  file?: string
  /** `"contests"` for migrated contests; omitted for legacy. */
  layout?: TournamentLayout
  /** Present when layout is contests (omitted for legacy). */
  contestPath?: string
}

export function normalizeLayout(value: unknown): TournamentLayout {
  return value === 'contests' ? 'contests' : 'legacy'
}

export function fromLeagueJson(row: LeagueJson): Tournament {
  const layout = normalizeLayout(row.layout)
  return {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle ?? '',
    sport: row.sport,
    layout,
    file: layout === 'legacy' ? (row.file ?? '') : null,
    contestPath: layout === 'contests' ? (row.contestPath ?? '') : null,
    startDate: row.startDate,
    endDate: row.endDate,
    endDateTo: row.endDateTo ? row.endDateTo : null,
    popularPriority: row.popularPriority,
  }
}

/** Export leagues.json-compatible shape (matches win-predict-ai-data catalog). */
export function toLeagueJson(row: Tournament): LeagueJson {
  const base: LeagueJson = {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle ?? '',
    sport: row.sport,
    startDate: row.startDate,
    endDate: row.endDate,
    endDateTo: row.endDateTo ?? '',
    popularPriority: row.popularPriority,
  }

  if (row.layout === 'contests') {
    return {
      ...base,
      layout: 'contests',
      contestPath: row.contestPath ?? '',
    }
  }

  return {
    ...base,
    file: row.file ?? '',
  }
}

export const SPORT_LABELS: Record<string, string> = {
  football: 'Football',
  basketball: 'Basketball',
  americanFootball: 'American Football',
  golf: 'Golf',
  baseball: 'Baseball',
  politics: 'Politics',
  hockey: 'Hockey',
  motorsport: 'Motorsport',
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
