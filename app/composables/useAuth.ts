import { createApiError } from '~/utils/errors'
import { isSuperAdminRole, type AdminUser } from '../../shared/user'

export type AuthUser = Pick<AdminUser, 'id' | 'email' | 'role'>

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const hydrated = useState<boolean>('auth-hydrated', () => false)

  const isAuthenticated = computed(() => Boolean(user.value))
  const isSuperAdmin = computed(() => isSuperAdminRole(user.value?.role))

  async function fetchMe() {
    try {
      user.value = await $fetch<AuthUser>('/api/auth/me')
    }
    catch {
      user.value = null
    }
    finally {
      hydrated.value = true
    }
  }

  async function ensureHydrated() {
    if (!hydrated.value) {
      await fetchMe()
    }
  }

  async function requestMagicLink(email: string) {
    const trimmed = email.trim()
    if (!trimmed) {
      throw createApiError(400, 'Email is required')
    }
    await $fetch('/api/auth/request', {
      method: 'POST',
      body: { email: trimmed },
    })
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
      user.value = null
      hydrated.value = true
    }
  }

  return {
    user,
    hydrated,
    isAuthenticated,
    isSuperAdmin,
    fetchMe,
    ensureHydrated,
    requestMagicLink,
    logout,
  }
}
