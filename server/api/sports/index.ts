import { proxyToSportsApi } from '../../utils/proxySports'

/** Exact /api/sports (optional catch-all does not always match this path). */
export default defineEventHandler((event) => proxyToSportsApi(event))
