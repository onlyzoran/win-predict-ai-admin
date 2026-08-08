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
    items.value = [...items.value, created].sort((a, b) => {
      if (a.role !== b.role) return a.role === 'superadmin' ? -1 : 1
      return a.createdAt - b.createdAt
    })
    return created
  }

  async function remove(id: string) {
    await $fetch(`/api/admins/${id}`, { method: 'DELETE' })
    items.value = items.value.filter((item) => item.id !== id)
  }

  return {
    items,
    loading,
    fetchAll,
    create,
    remove,
  }
}
