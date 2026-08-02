export default defineNuxtRouteMiddleware(async (to) => {
  const { status, getSession } = useAuth()

  // With SPA / disableServerSideAuth the session may still be loading —
  // always resolve it here instead of waiting forever on a watch.
  if (status.value === 'loading') {
    try {
      await getSession()
    }
    catch {
      // treat as unauthenticated below
    }
  }

  if (status.value !== 'authenticated') {
    return navigateTo({
      path: '/login',
      query: { callbackUrl: to.fullPath },
    })
  }
})
