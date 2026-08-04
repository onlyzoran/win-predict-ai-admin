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

export type Sport = (typeof SPORT_VALUES)[number]

export const SPORT_LABELS: Record<Sport, string> = {
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
