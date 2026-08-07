import { requireSession } from '../../utils/auth'
import { deleteTournament } from '../../utils/tournaments'

export default defineEventHandler(async (event) => {
  requireSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }
  deleteTournament(id)
  return { ok: true }
})
