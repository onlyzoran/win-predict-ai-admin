import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { tournaments } from '../../db/schema'
import { requireSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireSession(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const existing = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1)
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })
  }

  await db.delete(tournaments).where(eq(tournaments.id, id))
  return { ok: true }
})
