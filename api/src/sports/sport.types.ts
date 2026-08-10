export const SPORT_ICON_KEYS = [
  'football',
  'basketball',
  'americanFootball',
  'hockey',
  'baseball',
  'motorsport',
  'golf',
  'politics',
  'tennis',
  'rugby',
  'boxing',
  'waterPolo',
] as const

export type SportIconKey = (typeof SPORT_ICON_KEYS)[number]

export interface SportRow {
  id: string
  slug: string
  label: string
  icon_key: string
  sort_order: number
  is_enabled: number
  created_at: number
  updated_at: number
}

export interface SportDto {
  id: string
  slug: string
  label: string
  iconKey: string
  sortOrder: number
  isEnabled: boolean
  createdAt: number
  updatedAt: number
}

export function toSportDto(row: SportRow): SportDto {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    iconKey: row.icon_key,
    sortOrder: row.sort_order,
    isEnabled: Boolean(row.is_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
