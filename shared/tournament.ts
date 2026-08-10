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

/** App-facing tournament (null endDateTo for forms) */
export interface Tournament {
  id: string
  title: string
  fullTitle: string
  sport: Sport
  file: string
  startDate: string
  endDate: string
  endDateTo: string | null
  popularPriority: number
}

/** Shape stored in SQLite / leagues.json import */
export interface LeagueJson {
  id: string
  title: string
  fullTitle?: string
  sport: Sport
  file: string
  startDate: string
  endDate: string
  endDateTo: string
  popularPriority: number
}

export function fromLeagueJson(row: LeagueJson): Tournament {
  return {
    ...row,
    fullTitle: row.fullTitle ?? '',
    endDateTo: row.endDateTo ? row.endDateTo : null,
  }
}

export function toLeagueJson(row: Tournament): LeagueJson {
  return {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle ?? '',
    sport: row.sport,
    file: row.file,
    startDate: row.startDate,
    endDate: row.endDate,
    endDateTo: row.endDateTo ?? '',
    popularPriority: row.popularPriority,
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
