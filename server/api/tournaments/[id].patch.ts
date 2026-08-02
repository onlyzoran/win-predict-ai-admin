import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { tournaments } from '../../db/schema'
import { tournamentUpdateSchema } from '../../../schemas/tournament.schema'
import { requireSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireSession(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const body = await readBody(event)
  const parsed = tournamentUpdateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }

  const existing = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1)
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })
  }

  const current = existing[0]
  const data = parsed.data

  const next = {
    title: data.title ?? current.title,
    sport: data.sport ?? current.sport,
    file: data.file ?? current.file,
    startDate: data.startDate ?? current.startDate,
    endDate: data.endDate ?? current.endDate,
    endDateTo: data.endDateTo === undefined ? current.endDateTo : data.endDateTo,
    popularPriority: data.popularPriority ?? current.popularPriority,
  }

  if (next.endDate < next.startDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Дата окончания не может быть раньше даты начала',
    })
  }

  if (next.endDateTo && next.endDateTo < next.endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '«Окончание до» не может быть раньше даты окончания',
    })
  }

  const [updated] = await db
    .update(tournaments)
    .set(next)
    .where(eq(tournaments.id, id))
    .returning()

  return updated
})
