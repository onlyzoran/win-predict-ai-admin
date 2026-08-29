import {
  consumeMagicLink,
  createSession,
  setSessionCookie,
} from '../../utils/auth'
import { withAppBase } from '../../utils/appBase'
import { findActiveUserByEmail } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = typeof query.token === 'string' ? query.token : ''

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token is required' })
  }

  const email = consumeMagicLink(token)
  if (!email) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired link' })
  }

  if (!findActiveUserByEmail(email)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const sessionToken = createSession(email)
  setSessionCookie(event, sessionToken)

  const wantsJson = getRequestHeader(event, 'accept')?.includes('application/json')
  if (wantsJson) {
    return { ok: true, email }
  }

  const callback = typeof query.callbackUrl === 'string' ? query.callbackUrl : '/tournaments'
  const target = callback.startsWith('/') ? withAppBase(callback) : withAppBase('/tournaments')
  return sendRedirect(event, target)
})
