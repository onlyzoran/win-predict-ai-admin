import { requireSession } from '../../utils/auth'
import { createUser } from '../../utils/users'

export default defineEventHandler(async (event) => {
  requireSession(event)
  const body = await readBody<{ email?: string }>(event)
  return createUser(String(body?.email || ''))
})
