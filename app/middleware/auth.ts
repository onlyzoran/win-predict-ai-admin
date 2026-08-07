export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, ensureHydrated } = useAuth()
  await ensureHydrated()

  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { callbackUrl: to.fullPath },
    })
  }
})
