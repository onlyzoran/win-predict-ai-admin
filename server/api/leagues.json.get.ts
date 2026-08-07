import { listTournaments } from '../utils/tournaments'
import { toLeagueJson } from '../../shared/tournament'

/** Public leagues.json-compatible manifest for the main front app. */
export default defineEventHandler(() => {
  return listTournaments().map(toLeagueJson)
})
