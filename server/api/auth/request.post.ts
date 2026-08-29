import {
  canRequestMagicLink,
  createMagicLink,
  purgeExpiredAuthRows,
} from '../../utils/auth'
import { withAppBase } from '../../utils/appBase'
import { sendMagicLinkEmail } from '../../utils/mail'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = String(body?.email || '').trim().toLowerCase()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }

  purgeExpiredAuthRows()

  // Always return ok to avoid email enumeration
  if (!canRequestMagicLink(email)) {
    return { ok: true }
  }

  const token = createMagicLink(email)
  const origin = String(
    process.env.APP_URL
    || process.env.NUXT_APP_URL
    || useRuntimeConfig().appUrl,
  ).replace(/\/$/, '')
  const magicUrl = `${origin}${withAppBase('/api/auth/verify')}?token=${encodeURIComponent(token)}`

  await sendMagicLinkEmail(email, magicUrl)
  return { ok: true }
})
