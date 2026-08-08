import { requireSession } from '../../utils/auth'
import { listUsers } from '../../utils/users'

export default defineEventHandler((event) => {
  requireSession(event)
  return listUsers()
})
