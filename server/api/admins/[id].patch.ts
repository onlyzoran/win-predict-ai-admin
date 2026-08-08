import { requireSuperAdmin } from '../../utils/auth'
import { setUserActive } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const session = requireSuperAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User id is required' })
  }

  const body = await readBody<{ isActive?: boolean }>(event)
  if (typeof body?.isActive !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'isActive boolean is required' })
  }

  if (!body.isActive && session.id === id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot deactivate your own account' })
  }

  return setUserActive(id, body.isActive)
})
