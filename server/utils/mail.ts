export async function sendMagicLinkEmail(to: string, magicUrl: string) {
  const config = useRuntimeConfig()
  const apiKey = String(
    process.env.RESEND_API_KEY
    || process.env.NUXT_RESEND_API_KEY
    || config.resendApiKey
    || '',
  )
  const mailFrom = String(
    process.env.MAIL_FROM
    || process.env.NUXT_MAIL_FROM
    || config.mailFrom
    || 'onboarding@resend.dev',
  )

  if (!apiKey) {
    console.warn('[mail] RESEND_API_KEY is not set. Magic link for %s:\n%s', to, magicUrl)
    return { ok: true as const, mocked: true as const }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [to],
      subject: 'Sign in to Win Predict AI Admin',
      text: `Open this link to sign in (expires in 15 minutes):\n\n${magicUrl}\n`,
      html: `<p>Open this link to sign in (expires in 15 minutes):</p><p><a href="${magicUrl}">${magicUrl}</a></p>`,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[mail] Resend failed:', res.status, detail)
    throw createError({ statusCode: 502, statusMessage: 'Failed to send email' })
  }

  return { ok: true as const, mocked: false as const }
}
