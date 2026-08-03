import { z } from 'zod'
import { SPORT_VALUES } from '../shared/tournament'

export const sportSchema = z.enum(SPORT_VALUES)

const dateString = z
  .string()
  .min(1, 'Дата обязательна')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD')

export const tournamentCreateSchema = z
  .object({
    id: z.string().min(1).optional(),
    title: z.string().trim().min(1, 'Название обязательно'),
    fullTitle: z
      .string()
      .trim()
      .optional()
      .transform((v) => v ?? ''),
    sport: sportSchema,
    file: z.string().trim().min(1, 'Имя файла обязательно'),
    startDate: dateString,
    endDate: dateString,
    endDateTo: z
      .union([dateString, z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    popularPriority: z.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Дата окончания не может быть раньше даты начала',
        path: ['endDate'],
      })
    }
    if (data.endDateTo && data.endDateTo < data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '«Окончание до» не может быть раньше даты окончания',
        path: ['endDateTo'],
      })
    }
  })

export const tournamentUpdateSchema = z
  .object({
    title: z.string().trim().min(1, 'Название обязательно').optional(),
    fullTitle: z.string().trim().optional(),
    sport: sportSchema.optional(),
    file: z.string().trim().min(1, 'Имя файла обязательно').optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    endDateTo: z
      .union([dateString, z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    popularPriority: z.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Дата окончания не может быть раньше даты начала',
        path: ['endDate'],
      })
    }
    if (data.endDate && data.endDateTo && data.endDateTo < data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '«Окончание до» не может быть раньше даты окончания',
        path: ['endDateTo'],
      })
    }
  })

export const tournamentReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Нужен хотя бы один id'),
})

export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>
export type TournamentUpdateInput = z.infer<typeof tournamentUpdateSchema>
