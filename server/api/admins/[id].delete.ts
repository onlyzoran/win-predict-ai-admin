import { requireSuperAdmin } from '../../utils/auth'
import { deleteUser } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const session = requireSuperAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User id is required' })
  }

  deleteUser(id, session.id)
  return { ok: true }
})
