import { proxyToSportsApi } from '../../utils/proxySports'

/** Nested /api/sports/* → Nest /sports/* */
export default defineEventHandler((event) => proxyToSportsApi(event))
