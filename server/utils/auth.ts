import { createHmac, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { UserRole } from '../../shared/user'
import { appBaseURL } from './appBase'
import { useDb } from './db'
import { findActiveUserByEmail, touchLastLogin } from './users'

export const SESSION_COOKIE = 'wpa_session'

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export interface SessionUser {
  id: string
  email: string
  role: UserRole
}

function sessionSecret() {
  return (
    process.env.SESSION_SECRET
    || process.env.NUXT_SESSION_SECRET
    || useRuntimeConfig().sessionSecret
  )
}

function appUrl() {
  return (
    process.env.APP_URL
    || process.env.NUXT_APP_URL
    || useRuntimeConfig().appUrl
  )
}

export function hashToken(token: string) {
  return createHmac('sha256', sessionSecret()).update(token).digest('hex')
}

export function createToken() {
  return randomBytes(32).toString('hex')
}

export function canRequestMagicLink(email: string) {
  return Boolean(findActiveUserByEmail(email))
}

export function createMagicLink(email: string) {
  const db = useDb()
  const token = createToken()
  const now = Date.now()
  db.prepare(
    `INSERT INTO magic_links (token_hash, email, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(hashToken(token), email.trim().toLowerCase(), now + MAGIC_LINK_TTL_MS, now)
  return token
}

export function consumeMagicLink(token: string): string | null {
  const db = useDb()
  const now = Date.now()
  const row = db
    .prepare(
      `SELECT token_hash, email, expires_at FROM magic_links WHERE token_hash = ?`,
    )
    .get(hashToken(token)) as { token_hash: string; email: string; expires_at: number } | undefined

  if (!row) return null

  db.prepare(`DELETE FROM magic_links WHERE token_hash = ?`).run(row.token_hash)

  if (row.expires_at < now) return null
  return row.email
}

export function createSession(email: string) {
  const user = findActiveUserByEmail(email)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = useDb()
  const token = createToken()
  const now = Date.now()
  db.prepare(
    `INSERT INTO sessions (token_hash, email, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(hashToken(token), user.email, now + SESSION_TTL_MS, now)
  touchLastLogin(user.email)
  return token
}

export function getSessionUser(event: H3Event): SessionUser | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const db = useDb()
  const now = Date.now()
  const row = db
    .prepare(
      `SELECT s.email AS email, s.expires_at AS expires_at,
              u.id AS id, u.role AS role, u.is_active AS is_active
       FROM sessions s
       JOIN users u ON u.email = s.email
       WHERE s.token_hash = ?`,
    )
    .get(hashToken(token)) as {
      email: string
      expires_at: number
      id: string
      role: UserRole
      is_active: number
    } | undefined

  if (!row) return null

  if (row.expires_at < now || !row.is_active) {
    db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashToken(token))
    return null
  }

  return { id: row.id, email: row.email, role: row.role }
}

export function requireSession(event: H3Event): SessionUser {
  const user = getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

export function requireSuperAdmin(event: H3Event): SessionUser {
  const user = requireSession(event)
  if (user.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

export function setSessionCookie(event: H3Event, token: string) {
  const secure = String(appUrl()).startsWith('https://')
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: appBaseURL(),
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure,
  })
}

export function clearSessionCookie(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    useDb().prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashToken(token))
  }
  deleteCookie(event, SESSION_COOKIE, { path: appBaseURL() })
}

export function purgeExpiredAuthRows() {
  const db = useDb()
  const now = Date.now()
  db.prepare(`DELETE FROM magic_links WHERE expires_at < ?`).run(now)
  db.prepare(`DELETE FROM sessions WHERE expires_at < ?`).run(now)
}
