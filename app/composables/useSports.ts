import type {
  SportCatalogItem,
  SportCreateInput,
  SportUpdateInput,
} from '../../shared/sport'

export function useSportsApi() {
  async function listEnabled() {
    return $fetch<SportCatalogItem[]>('/api/sports')
  }

  async function listAll() {
    return $fetch<SportCatalogItem[]>('/api/sports/all')
  }

  async function create(payload: SportCreateInput) {
    return $fetch<SportCatalogItem>('/api/sports', {
      method: 'POST',
      body: payload,
    })
  }

  async function update(id: string, payload: SportUpdateInput) {
    return $fetch<SportCatalogItem>(`/api/sports/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function remove(id: string) {
    await $fetch(`/api/sports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return { ok: true }
  }

  async function reorder(ids: string[]) {
    await $fetch('/api/sports/reorder', {
      method: 'POST',
      body: { ids },
    })
    return { ok: true }
  }

  return {
    listEnabled,
    listAll,
    create,
    update,
    remove,
    reorder,
  }
}
