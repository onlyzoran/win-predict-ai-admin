import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { tournaments } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const rows = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1)
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })
  }

  return rows[0]
})
