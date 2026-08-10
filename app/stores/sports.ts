import { defineStore } from 'pinia'
import type { SportCatalogItem, SportCreateInput, SportUpdateInput } from '../../shared/sport'

export const useSportsStore = defineStore('sports', () => {
  const api = useSportsApi()

  const items = ref<SportCatalogItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await api.listAll()
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load sports'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  async function createSport(payload: SportCreateInput) {
    const created = await api.create(payload)
    items.value = [...items.value, created].sort((a, b) => a.sortOrder - b.sortOrder)
    return created
  }

  async function updateSport(id: string, payload: SportUpdateInput) {
    const updated = await api.update(id, payload)
    items.value = items.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  async function deleteSport(id: string) {
    await api.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  async function reorderSports(ids: string[]) {
    const previous = [...items.value]
    const byId = new Map(items.value.map((item) => [item.id, item]))
    items.value = ids
      .map((id, index) => {
        const item = byId.get(id)
        if (!item) return null
        return { ...item, sortOrder: (index + 1) * 10 }
      })
      .filter((item): item is SportCatalogItem => item != null)

    try {
      await api.reorder(ids)
    }
    catch (err) {
      items.value = previous
      throw err
    }
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    createSport,
    updateSport,
    deleteSport,
    reorderSports,
  }
})
