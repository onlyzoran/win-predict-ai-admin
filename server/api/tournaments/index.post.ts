import { tournamentCreateSchema } from '../../../schemas/tournament.schema'
import { requireSession } from '../../utils/auth'
import { createTournament } from '../../utils/tournaments'

export default defineEventHandler(async (event) => {
  requireSession(event)
  const body = await readBody(event)
  const parsed = tournamentCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Invalid payload',
    })
  }
  return createTournament(parsed.data)
})
