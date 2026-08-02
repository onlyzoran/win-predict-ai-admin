import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { tournaments } from '../../db/schema'
import { tournamentReorderSchema } from '../../../schemas/tournament.schema'
import { requireSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireSession(event)

  const body = await readBody(event)
  const parsed = tournamentReorderSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }

  const { ids } = parsed.data
  const sqlite = db.$client

  const update = sqlite.prepare(
    'UPDATE tournaments SET popular_priority = ? WHERE id = ?',
  )

  const reorder = sqlite.transaction((orderedIds: string[]) => {
    for (let i = 0; i < orderedIds.length; i++) {
      update.run((i + 1) * 10, orderedIds[i])
    }
  })

  reorder(ids)

  return { ok: true }
})
