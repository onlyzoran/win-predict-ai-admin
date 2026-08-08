import { randomBytes } from 'node:crypto'
import type { AdminUser, UserRole } from '../../shared/user'
import { useDb } from './db'

interface UserRow {
  id: string
  email: string
  role: string
  is_active: number
  created_at: number
  last_login_at: number | null
}

function mapUser(row: UserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  }
}

function createUserId() {
  return randomBytes(16).toString('hex')
}

export function listUsers(): AdminUser[] {
  const rows = useDb()
    .prepare(
      `SELECT id, email, role, is_active, created_at, last_login_at
       FROM users
       ORDER BY created_at ASC, email ASC`,
    )
    .all() as UserRow[]
  return rows.map(mapUser)
}

export function findUserById(id: string): AdminUser | null {
  const row = useDb()
    .prepare(
      `SELECT id, email, role, is_active, created_at, last_login_at
       FROM users WHERE id = ?`,
    )
    .get(id) as UserRow | undefined
  return row ? mapUser(row) : null
}

export function findUserByEmail(email: string): AdminUser | null {
  const row = useDb()
    .prepare(
      `SELECT id, email, role, is_active, created_at, last_login_at
       FROM users WHERE email = ?`,
    )
    .get(email.trim().toLowerCase()) as UserRow | undefined
  return row ? mapUser(row) : null
}

export function findActiveUserByEmail(email: string): AdminUser | null {
  const user = findUserByEmail(email)
  if (!user || !user.isActive) return null
  return user
}

export function countActiveAdmins(): number {
  const row = useDb()
    .prepare(
      `SELECT COUNT(*) AS count FROM users WHERE is_active = 1 AND role = 'admin'`,
    )
    .get() as { count: number }
  return row.count
}

export function createUser(email: string, role: UserRole = 'admin'): AdminUser {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }

  const existing = findUserByEmail(normalized)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists' })
  }

  const id = createUserId()
  const now = Date.now()
  useDb()
    .prepare(
      `INSERT INTO users (id, email, role, is_active, created_at, last_login_at)
       VALUES (?, ?, ?, 1, ?, NULL)`,
    )
    .run(id, normalized, role, now)

  return findUserById(id)!
}

export function setUserActive(id: string, isActive: boolean): AdminUser {
  const user = findUserById(id)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (user.isActive === isActive) return user

  if (!isActive && user.role === 'admin' && countActiveAdmins() <= 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot deactivate the last active admin',
    })
  }

  useDb()
    .prepare(`UPDATE users SET is_active = ? WHERE id = ?`)
    .run(isActive ? 1 : 0, id)

  if (!isActive) {
    useDb().prepare(`DELETE FROM sessions WHERE email = ?`).run(user.email)
  }

  return findUserById(id)!
}

export function touchLastLogin(email: string) {
  useDb()
    .prepare(`UPDATE users SET last_login_at = ? WHERE email = ?`)
    .run(Date.now(), email.trim().toLowerCase())
}
