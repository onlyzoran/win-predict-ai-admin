import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { SPORT_VALUES, type Sport } from '../../shared/tournament'

export type { Sport }
export { SPORT_VALUES }

export const tournaments = sqliteTable('tournaments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  sport: text('sport', { enum: SPORT_VALUES }).notNull(),
  file: text('file').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  endDateTo: text('end_date_to'),
  popularPriority: integer('popular_priority').notNull().default(0),
})

export type Tournament = typeof tournaments.$inferSelect
export type NewTournament = typeof tournaments.$inferInsert
