import {
  consumeMagicLink,
  createSession,
  setSessionCookie,
} from '../../utils/auth'

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

  const sessionToken = createSession(email)
  setSessionCookie(event, sessionToken)

  const wantsJson = getRequestHeader(event, 'accept')?.includes('application/json')
  if (wantsJson) {
    return { ok: true, email }
  }

  const callback = typeof query.callbackUrl === 'string' ? query.callbackUrl : '/tournaments'
  return sendRedirect(event, callback.startsWith('/') ? callback : '/tournaments')
})
