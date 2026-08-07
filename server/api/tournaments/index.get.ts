import { listTournaments } from '../../utils/tournaments'

export default defineEventHandler(() => {
  return listTournaments()
})
