import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { tournaments } from '../../db/schema'
import { tournamentCreateSchema } from '../../../schemas/tournament.schema'
import { slugify } from '../../../shared/tournament'
import { requireSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireSession(event)

  const body = await readBody(event)
  const parsed = tournamentCreateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }

  const data = parsed.data
  const id = data.id?.trim() || slugify(data.title)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не удалось сгенерировать id' })
  }

  const existing = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1)
  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Турнир с таким id уже существует' })
  }

  let popularPriority = data.popularPriority
  if (popularPriority == null) {
    const all = await db.select({ popularPriority: tournaments.popularPriority }).from(tournaments)
    const max = all.reduce((acc, row) => Math.max(acc, row.popularPriority), 0)
    popularPriority = max + 10
  }

  const [created] = await db
    .insert(tournaments)
    .values({
      id,
      title: data.title,
      sport: data.sport,
      file: data.file,
      startDate: data.startDate,
      endDate: data.endDate,
      endDateTo: data.endDateTo,
      popularPriority,
    })
    .returning()

  return created
})
