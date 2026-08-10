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

/** Sport catalog entry managed by Nest API */
export interface SportCatalogItem {
  id: string
  slug: string
  label: string
  iconKey: SportIconKey | string
  sortOrder: number
  isEnabled: boolean
  createdAt: number
  updatedAt: number
}

export interface SportCreateInput {
  slug: string
  label: string
  iconKey: string
  isEnabled?: boolean
}

export interface SportUpdateInput {
  label?: string
  iconKey?: string
  isEnabled?: boolean
}
