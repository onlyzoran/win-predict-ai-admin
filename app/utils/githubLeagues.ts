import type { Sport } from '../../shared/tournament'
import { slugify } from '../../shared/tournament'
import type { TournamentCreateInput, TournamentUpdateInput } from '../../schemas/tournament.schema'
import { createApiError } from '~/utils/errors'

/** Shape stored in win-predict-ai-data/data/leagues.json */
export interface LeagueJson {
  id: string
  title: string
  sport: Sport
  file: string
  startDate: string
  endDate: string
  endDateTo: string
  popularPriority: number
}

/** App-facing tournament (null endDateTo for forms) */
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

interface GithubFileResponse {
  sha: string
  content: string
  encoding: string
}

interface GithubConfig {
  owner: string
  repo: string
  path: string
  branch: string
}

function getConfig(): GithubConfig {
  const publicConfig = useRuntimeConfig().public
  return {
    owner: publicConfig.githubOwner,
    repo: publicConfig.githubRepo,
    path: publicConfig.githubPath,
    branch: publicConfig.githubBranch,
  }
}

function contentsUrl(config: GithubConfig) {
  return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${encodeURIComponent(config.branch)}`
}

function putUrl(config: GithubConfig) {
  return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`
}

function authHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function fromJson(row: LeagueJson): Tournament {
  return {
    ...row,
    endDateTo: row.endDateTo ? row.endDateTo : null,
  }
}

function toJson(row: Tournament): LeagueJson {
  return {
    id: row.id,
    title: row.title,
    sport: row.sport,
    file: row.file,
    startDate: row.startDate,
    endDate: row.endDate,
    endDateTo: row.endDateTo ?? '',
    popularPriority: row.popularPriority,
  }
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function decodeContent(file: GithubFileResponse): LeagueJson[] {
  const raw = decodeBase64(file.content)
  const parsed = JSON.parse(raw) as LeagueJson[]
  if (!Array.isArray(parsed)) {
    throw createApiError(500, 'leagues.json is not an array')
  }
  return parsed
}

async function readFile(token: string): Promise<{ leagues: LeagueJson[]; sha: string }> {
  const config = getConfig()
  const res = await fetch(contentsUrl(config), { headers: authHeaders(token) })

  if (!res.ok) {
    throw createApiError(res.status, `Failed to read leagues.json (${res.status})`)
  }

  const file = (await res.json()) as GithubFileResponse
  return { leagues: decodeContent(file), sha: file.sha }
}

async function writeFile(
  token: string,
  leagues: LeagueJson[],
  sha: string,
  message: string,
): Promise<void> {
  const config = getConfig()
  const body = {
    message,
    content: encodeBase64(`${JSON.stringify(leagues, null, 2)}\n`),
    sha,
    branch: config.branch,
  }

  const res = await fetch(putUrl(config), {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (res.status === 409) {
    throw createApiError(409, 'Conflict: leagues.json was updated elsewhere. Reload and try again.')
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createApiError(res.status, detail || `Failed to write leagues.json (${res.status})`)
  }
}

function sortByPriority(leagues: LeagueJson[]): LeagueJson[] {
  return [...leagues].sort((a, b) => a.popularPriority - b.popularPriority)
}

export async function listLeagues(token: string): Promise<Tournament[]> {
  const { leagues } = await readFile(token)
  return sortByPriority(leagues).map(fromJson)
}

export async function getLeagueById(token: string, id: string): Promise<Tournament> {
  const { leagues } = await readFile(token)
  const found = leagues.find((item) => item.id === id)
  if (!found) {
    throw createApiError(404, 'Tournament not found')
  }
  return fromJson(found)
}

export async function createLeague(token: string, payload: TournamentCreateInput): Promise<Tournament> {
  const { leagues, sha } = await readFile(token)
  const id = payload.id?.trim() || slugify(payload.title)

  if (!id) {
    throw createApiError(400, 'Could not generate id')
  }

  if (leagues.some((item) => item.id === id)) {
    throw createApiError(409, 'Tournament with this id already exists')
  }

  let popularPriority = payload.popularPriority
  if (popularPriority == null) {
    const max = leagues.reduce((acc, row) => Math.max(acc, row.popularPriority), 0)
    popularPriority = max + 10
  }

  const created: Tournament = {
    id,
    title: payload.title,
    sport: payload.sport,
    file: payload.file,
    startDate: payload.startDate,
    endDate: payload.endDate,
    endDateTo: payload.endDateTo ?? null,
    popularPriority,
  }

  const next = sortByPriority([...leagues, toJson(created)])
  await writeFile(token, next, sha, `admin: create tournament ${id}`)
  return created
}

export async function updateLeague(
  token: string,
  id: string,
  payload: TournamentUpdateInput,
): Promise<Tournament> {
  const { leagues, sha } = await readFile(token)
  const index = leagues.findIndex((item) => item.id === id)
  if (index < 0) {
    throw createApiError(404, 'Tournament not found')
  }

  const current = fromJson(leagues[index])
  const updated: Tournament = {
    id,
    title: payload.title ?? current.title,
    sport: payload.sport ?? current.sport,
    file: payload.file ?? current.file,
    startDate: payload.startDate ?? current.startDate,
    endDate: payload.endDate ?? current.endDate,
    endDateTo: payload.endDateTo === undefined ? current.endDateTo : payload.endDateTo,
    popularPriority: payload.popularPriority ?? current.popularPriority,
  }

  if (updated.endDate < updated.startDate) {
    throw createApiError(400, 'End date cannot be earlier than start date')
  }
  if (updated.endDateTo && updated.endDateTo < updated.endDate) {
    throw createApiError(400, '“End by” cannot be earlier than the end date')
  }

  const next = [...leagues]
  next[index] = toJson(updated)
  await writeFile(token, sortByPriority(next), sha, `admin: update tournament ${id}`)
  return updated
}

export async function deleteLeague(token: string, id: string): Promise<void> {
  const { leagues, sha } = await readFile(token)
  if (!leagues.some((item) => item.id === id)) {
    throw createApiError(404, 'Tournament not found')
  }
  const next = leagues.filter((item) => item.id !== id)
  await writeFile(token, next, sha, `admin: delete tournament ${id}`)
}

export async function reorderLeagues(token: string, ids: string[]): Promise<void> {
  const { leagues, sha } = await readFile(token)
  const byId = new Map(leagues.map((item) => [item.id, item]))

  const next: LeagueJson[] = []
  for (const [index, id] of ids.entries()) {
    const item = byId.get(id)
    if (!item) continue
    next.push({ ...item, popularPriority: (index + 1) * 10 })
    byId.delete(id)
  }

  // Keep any ids missing from the payload at the end with existing priorities
  for (const leftover of byId.values()) {
    next.push(leftover)
  }

  await writeFile(token, next, sha, 'admin: reorder tournaments')
}
