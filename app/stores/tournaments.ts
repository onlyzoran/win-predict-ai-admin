import { defineStore } from 'pinia'
import type { Sport } from '../../shared/tournament'
import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'
import type { Tournament } from '~/composables/useTournaments'

export const useTournamentsStore = defineStore('tournaments', () => {
  const api = useTournamentsApi()

  const items = ref<Tournament[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const sportFilter = ref<Sport | 'all'>('all')

  const filteredItems = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return items.value.filter((item) => {
      if (sportFilter.value !== 'all' && item.sport !== sportFilter.value) {
        return false
      }
      if (query && !item.title.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  })

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await api.list()
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tournaments'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  async function createTournament(payload: TournamentCreateInput) {
    const created = await api.create(payload)
    items.value = [...items.value, created].sort((a, b) => a.popularPriority - b.popularPriority)
    return created
  }

  async function updateTournament(id: string, payload: TournamentUpdateInput) {
    const updated = await api.update(id, payload)
    items.value = items.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  async function deleteTournament(id: string) {
    await api.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  async function reorderTournaments(ids: string[]) {
    const previous = [...items.value]
    const byId = new Map(items.value.map((item) => [item.id, item]))
    items.value = ids
      .map((id, index) => {
        const item = byId.get(id)
        if (!item) return null
        return { ...item, popularPriority: (index + 1) * 10 }
      })
      .filter((item): item is Tournament => item != null)

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
    searchQuery,
    sportFilter,
    filteredItems,
    fetchAll,
    createTournament,
    updateTournament,
    deleteTournament,
    reorderTournaments,
  }
})
