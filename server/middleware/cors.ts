const PUBLIC_PATHS = ['/api/tournaments', '/api/leagues.json', '/api/sports']

function isPublicReadApi(pathname: string) {
  return PUBLIC_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (!isPublicReadApi(pathname)) {
    return
  }

  setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Accept, Content-Type')
  setResponseHeader(event, 'Access-Control-Max-Age', '86400')

  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
