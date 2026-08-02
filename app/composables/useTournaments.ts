import type { Sport } from '../../shared/tournament'
import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'

export interface Tournament {
  id: string
  title: string
  sport: Sport
  file: string
  startDate: string
  endDate: string
  endDateTo: string | null
  popularPriority: number
}

export function useTournamentsApi() {
  async function list() {
    return $fetch<Tournament[]>('/api/tournaments')
  }

  async function getById(id: string) {
    return $fetch<Tournament>(`/api/tournaments/${id}`)
  }

  async function create(payload: TournamentCreateInput) {
    return $fetch<Tournament>('/api/tournaments', {
      method: 'POST',
      body: payload,
    })
  }

  async function update(id: string, payload: TournamentUpdateInput) {
    return $fetch<Tournament>(`/api/tournaments/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function remove(id: string) {
    return $fetch<{ ok: boolean }>(`/api/tournaments/${id}`, {
      method: 'DELETE',
    })
  }

  async function reorder(ids: string[]) {
    return $fetch<{ ok: boolean }>('/api/tournaments/reorder', {
      method: 'PATCH',
      body: { ids },
    })
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
