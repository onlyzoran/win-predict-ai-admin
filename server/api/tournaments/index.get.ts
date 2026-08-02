import { asc } from 'drizzle-orm'
import { db } from '../../db/client'
import { tournaments } from '../../db/schema'

export default defineEventHandler(async () => {
  return db.select().from(tournaments).orderBy(asc(tournaments.popularPriority))
})
