import { createApiError } from '~/utils/errors'

const TOKEN_KEY = 'wpa_github_pat'

export function useGithubAuth() {
  const token = useState<string | null>('github-pat', () => null)

  function readStoredToken(): string | null {
    if (!import.meta.client) return null
    return sessionStorage.getItem(TOKEN_KEY)
  }

  function hydrate() {
    if (token.value) return
    token.value = readStoredToken()
  }

  const isAuthenticated = computed(() => {
    hydrate()
    return Boolean(token.value)
  })

  function getToken(): string | null {
    hydrate()
    return token.value
  }

  function requireToken(): string {
    const value = getToken()
    if (!value) {
      throw createApiError(401, 'Not authenticated')
    }
    return value
  }

  async function login(pat: string) {
    const trimmed = pat.trim()
    if (!trimmed) {
      throw createApiError(400, 'Token is required')
    }

    const config = useRuntimeConfig().public
    const url = `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${config.githubPath}?ref=${encodeURIComponent(config.githubBranch)}`

    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${trimmed}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw createApiError(401, 'Invalid token or insufficient permissions')
      }
      throw createApiError(res.status, `GitHub auth check failed (${res.status})`)
    }

    token.value = trimmed
    sessionStorage.setItem(TOKEN_KEY, trimmed)
  }

  function logout() {
    token.value = null
    if (import.meta.client) {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }

  return {
    token,
    isAuthenticated,
    getToken,
    requireToken,
    login,
    logout,
    hydrate,
  }
}
