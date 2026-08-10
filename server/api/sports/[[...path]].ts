/** Proxy /api/sports → Nest sidecar (preserves session cookie, same-origin). */
export default defineEventHandler(async (event) => {
  const port = process.env.API_PORT || useRuntimeConfig().apiPort || '3001'
  const url = getRequestURL(event)
  const nestPath = event.path.replace(/^\/api\/sports\/?/, '/sports/') || '/sports'
  const normalized = nestPath.replace(/\/sports\/$/, '/sports')
  const target = `http://127.0.0.1:${port}${normalized}${url.search}`
  return proxyRequest(event, target)
})
