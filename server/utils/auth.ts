import { createHmac, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { useDb } from './db'

export const SESSION_COOKIE = 'wpa_session'

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export interface SessionUser {
  email: string
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

function adminEmailsRaw() {
  return (
    process.env.ADMIN_EMAILS
    || process.env.NUXT_ADMIN_EMAILS
    || useRuntimeConfig().adminEmails
    || ''
  )
}

export function hashToken(token: string) {
  return createHmac('sha256', sessionSecret()).update(token).digest('hex')
}

export function createToken() {
  return randomBytes(32).toString('hex')
}

export function parseAdminEmails(): Set<string> {
  const raw = String(adminEmailsRaw())
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isAllowedAdminEmail(email: string) {
  return parseAdminEmails().has(email.trim().toLowerCase())
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
  const db = useDb()
  const token = createToken()
  const now = Date.now()
  db.prepare(
    `INSERT INTO sessions (token_hash, email, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(hashToken(token), email.trim().toLowerCase(), now + SESSION_TTL_MS, now)
  return token
}

export function getSessionUser(event: H3Event): SessionUser | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const db = useDb()
  const now = Date.now()
  const row = db
    .prepare(`SELECT email, expires_at FROM sessions WHERE token_hash = ?`)
    .get(hashToken(token)) as { email: string; expires_at: number } | undefined

  if (!row) return null
  if (row.expires_at < now) {
    db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashToken(token))
    return null
  }

  return { email: row.email }
}

export function requireSession(event: H3Event): SessionUser {
  const user = getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

export function setSessionCookie(event: H3Event, token: string) {
  const secure = String(appUrl()).startsWith('https://')
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure,
  })
}

export function clearSessionCookie(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    useDb().prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashToken(token))
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function purgeExpiredAuthRows() {
  const db = useDb()
  const now = Date.now()
  db.prepare(`DELETE FROM magic_links WHERE expires_at < ?`).run(now)
  db.prepare(`DELETE FROM sessions WHERE expires_at < ?`).run(now)
}
