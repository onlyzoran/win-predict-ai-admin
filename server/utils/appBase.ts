import { joinURL, withoutTrailingSlash } from 'ufo'

/** App base path from Nuxt (`/` or `/admin/`). */
export function appBaseURL(): string {
  const raw = useRuntimeConfig().app?.baseURL || process.env.NUXT_APP_BASE_URL || '/'
  if (!raw || raw === '/') return '/'
  return withoutTrailingSlash(raw) + '/'
}

/** Strip `app.baseURL` so `/admin/api/foo` → `/api/foo`. */
export function pathWithoutAppBase(pathname: string): string {
  const base = withoutTrailingSlash(appBaseURL())
  if (base && base !== '/' && pathname.startsWith(base)) {
    const rest = pathname.slice(base.length)
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  return pathname
}

/** Prefix an in-app path with baseURL (`/tournaments` → `/admin/tournaments`). */
export function withAppBase(path: string): string {
  const base = appBaseURL()
  if (!path.startsWith('/')) return joinURL(base, path)
  if (base === '/') return path
  const baseNoSlash = withoutTrailingSlash(base)
  if (path === baseNoSlash || path.startsWith(`${baseNoSlash}/`)) return path
  return joinURL(base, path)
}
