export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, hydrate } = useGithubAuth()
  hydrate()

  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { callbackUrl: to.fullPath },
    })
  }
})
