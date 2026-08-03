import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'
import {
  createLeague,
  deleteLeague,
  getLeagueById,
  listLeagues,
  reorderLeagues,
  updateLeague,
} from '~/utils/githubLeagues'

export function useTournamentsApi() {
  const { requireToken } = useGithubAuth()

  async function list() {
    return listLeagues(requireToken())
  }

  async function getById(id: string) {
    return getLeagueById(requireToken(), id)
  }

  async function create(payload: TournamentCreateInput) {
    return createLeague(requireToken(), payload)
  }

  async function update(id: string, payload: TournamentUpdateInput) {
    return updateLeague(requireToken(), id, payload)
  }

  async function remove(id: string) {
    await deleteLeague(requireToken(), id)
    return { ok: true }
  }

  async function reorder(ids: string[]) {
    await reorderLeagues(requireToken(), ids)
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
