import { tournamentUpdateSchema } from '../../../schemas/tournament.schema'
import { requireSession } from '../../utils/auth'
import { updateTournament } from '../../utils/tournaments'

export default defineEventHandler(async (event) => {
  requireSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody(event)
  const parsed = tournamentUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Invalid payload',
    })
  }

  return updateTournament(id, parsed.data)
})
