import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'
import type { Tournament } from '../../shared/tournament'

export function useTournamentsApi() {
  async function list() {
    return $fetch<Tournament[]>('/api/tournaments')
  }

  async function getById(id: string) {
    return $fetch<Tournament>(`/api/tournaments/${encodeURIComponent(id)}`)
  }

  async function create(payload: TournamentCreateInput) {
    return $fetch<Tournament>('/api/tournaments', {
      method: 'POST',
      body: payload,
    })
  }

  async function update(id: string, payload: TournamentUpdateInput) {
    return $fetch<Tournament>(`/api/tournaments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function remove(id: string) {
    await $fetch(`/api/tournaments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return { ok: true }
  }

  async function reorder(ids: string[]) {
    await $fetch('/api/tournaments/reorder', {
      method: 'POST',
      body: { ids },
    })
    return { ok: true }
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
    reorder,
  }
}
