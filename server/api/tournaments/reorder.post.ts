import { tournamentReorderSchema } from '../../../schemas/tournament.schema'
import { requireSession } from '../../utils/auth'
import { reorderTournaments } from '../../utils/tournaments'

export default defineEventHandler(async (event) => {
  requireSession(event)
  const body = await readBody(event)
  const parsed = tournamentReorderSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Invalid payload',
    })
  }
  reorderTournaments(parsed.data.ids)
  return { ok: true }
})
