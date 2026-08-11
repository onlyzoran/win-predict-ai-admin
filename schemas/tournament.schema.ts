import { z } from 'zod'
import { TOURNAMENT_LAYOUTS } from '../shared/tournament'

export const sportSchema = z.string().trim().min(1, 'Sport is required')

const dateString = z
  .string()
  .min(1, 'Дата обязательна')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD')

const layoutSchema = z.enum(TOURNAMENT_LAYOUTS).default('legacy')

function refineLayoutPaths(
  data: {
    layout?: 'legacy' | 'contests'
    file?: string | null
    contestPath?: string | null
  },
  ctx: z.RefinementCtx,
) {
  const layout = data.layout ?? 'legacy'
  if (layout === 'contests') {
    if (!data.contestPath?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'contestPath обязателен для layout contests',
        path: ['contestPath'],
      })
    }
  }
  else if (!data.file?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Имя файла обязательно',
      path: ['file'],
    })
  }
}

function refineDates(
  data: {
    startDate?: string
    endDate?: string
    endDateTo?: string | null
  },
  ctx: z.RefinementCtx,
) {
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
}

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
    layout: layoutSchema,
    file: z
      .union([z.string().trim(), z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    contestPath: z
      .union([z.string().trim(), z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    startDate: dateString,
    endDate: dateString,
    endDateTo: z
      .union([dateString, z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    popularPriority: z.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    refineLayoutPaths(data, ctx)
    refineDates(data, ctx)
  })
  .transform((data) => {
    const layout = data.layout ?? 'legacy'
    if (layout === 'contests') {
      return {
        ...data,
        layout,
        file: null as string | null,
        contestPath: data.contestPath,
      }
    }
    return {
      ...data,
      layout: 'legacy' as const,
      file: data.file,
      contestPath: null as string | null,
    }
  })

export const tournamentUpdateSchema = z
  .object({
    title: z.string().trim().min(1, 'Название обязательно').optional(),
    fullTitle: z.string().trim().optional(),
    sport: sportSchema.optional(),
    layout: z.enum(TOURNAMENT_LAYOUTS).optional(),
    file: z
      .union([z.string().trim(), z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    contestPath: z
      .union([z.string().trim(), z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    endDateTo: z
      .union([dateString, z.literal(''), z.null()])
      .optional()
      .transform((v) => (v === '' || v == null ? null : v)),
    popularPriority: z.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.layout != null || data.file !== undefined || data.contestPath !== undefined) {
      refineLayoutPaths(
        {
          layout: data.layout,
          file: data.file,
          contestPath: data.contestPath,
        },
        ctx,
      )
    }
    refineDates(data, ctx)
  })

export const tournamentReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Нужен хотя бы один id'),
})

export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>
export type TournamentUpdateInput = z.infer<typeof tournamentUpdateSchema>
