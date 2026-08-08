import type { AdminUser } from '../../shared/user'
import { createApiError } from '~/utils/errors'

export function useAdmins() {
  const items = ref<AdminUser[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      items.value = await $fetch<AdminUser[]>('/api/admins')
    }
    finally {
      loading.value = false
    }
  }

  async function create(email: string) {
    const trimmed = email.trim()
    if (!trimmed) {
      throw createApiError(400, 'Email is required')
    }
    const created = await $fetch<AdminUser>('/api/admins', {
      method: 'POST',
      body: { email: trimmed },
    })
    items.value = [...items.value, created].sort((a, b) => a.createdAt - b.createdAt)
    return created
  }

  async function setActive(id: string, isActive: boolean) {
    const updated = await $fetch<AdminUser>(`/api/admins/${id}`, {
      method: 'PATCH',
      body: { isActive },
    })
    items.value = items.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  return {
    items,
    loading,
    fetchAll,
    create,
    setActive,
  }
}
