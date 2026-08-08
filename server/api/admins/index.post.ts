import { requireSuperAdmin } from '../../utils/auth'
import { createUser } from '../../utils/users'

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event)
  const body = await readBody<{ email?: string }>(event)
  return createUser(String(body?.email || ''), 'admin')
})
