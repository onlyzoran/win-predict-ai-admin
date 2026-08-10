import { Injectable, UnauthorizedException } from '@nestjs/common'
import { createHmac } from 'node:crypto'
import type { Request } from 'express'
import { DatabaseService } from '../database/database.service'

export const SESSION_COOKIE = 'wpa_session'

export interface SessionUser {
  id: string
  email: string
  role: string
}

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  private sessionSecret() {
    return (
      process.env.SESSION_SECRET
      || process.env.NUXT_SESSION_SECRET
      || 'dev-secret-change-me'
    )
  }

  hashToken(token: string) {
    return createHmac('sha256', this.sessionSecret()).update(token).digest('hex')
  }

  getSessionUser(req: Request): SessionUser | null {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined
    if (!token) return null

    const db = this.database.connection
    const now = Date.now()
    const row = db
      .prepare(
        `SELECT s.email AS email, s.expires_at AS expires_at,
                u.id AS id, u.role AS role, u.is_active AS is_active
         FROM sessions s
         JOIN users u ON u.email = s.email
         WHERE s.token_hash = ?`,
      )
      .get(this.hashToken(token)) as {
        email: string
        expires_at: number
        id: string
        role: string
        is_active: number
      } | undefined

    if (!row) return null

    if (row.expires_at < now || !row.is_active) {
      db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(this.hashToken(token))
      return null
    }

    return { id: row.id, email: row.email, role: row.role }
  }

  requireSession(req: Request): SessionUser {
    const user = this.getSessionUser(req)
    if (!user) {
      throw new UnauthorizedException('Unauthorized')
    }
    return user
  }
}
