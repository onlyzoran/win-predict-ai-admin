import { getToken } from '#auth'
import type { H3Event } from 'h3'

export async function requireSession(event: H3Event) {
  const token = await getToken({ event })
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return token
}
