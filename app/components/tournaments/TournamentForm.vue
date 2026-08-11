<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { slugify } from '@/lib/utils'
import type { SportCatalogItem } from '../../../shared/sport'
import type { Tournament, TournamentLayout } from '../../../shared/tournament'
import { TOURNAMENT_LAYOUTS } from '../../../shared/tournament'
import Button from '@/components/ui/button/Button.vue'
import DateInput from '@/components/ui/date-input/DateInput.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import NativeSelect from '@/components/ui/select/NativeSelect.vue'

export type TournamentFormPayload = {
  title: string
  fullTitle: string
  sport: string
  layout: TournamentLayout
  file: string | null
  contestPath: string | null
  startDate: string
  endDate: string
  endDateTo: string | null
}

const props = defineProps<{
  tournament?: Tournament | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: TournamentFormPayload]
  cancel: []
}>()

const { t, locale } = useI18n()
const isEdit = computed(() => Boolean(props.tournament))
const sportsApi = useSportsApi()
const sportOptions = ref<SportCatalogItem[]>([])

onMounted(async () => {
  try {
    sportOptions.value = await sportsApi.listAll()
  }
  catch {
    sportOptions.value = []
  }
})

function optionLabel(item: SportCatalogItem) {
  const key = `sports.${item.slug}`
  const translated = t(key)
  return translated === key ? item.label : translated
}

const defaultSport = computed(
  () => props.tournament?.sport
    || sportOptions.value.find((s) => s.isEnabled)?.slug
    || sportOptions.value[0]?.slug
    || '',
)

const formSchema = computed(() => {
  void locale.value
  return toTypedSchema(
    z
      .object({
        title: z.string().trim().min(1, t('form.errors.titleRequired')),
        fullTitle: z.string().trim().optional(),
        sport: z.string().trim().min(1, t('form.errors.sportRequired')),
        layout: z.enum(TOURNAMENT_LAYOUTS),
        file: z.string().trim().optional(),
        contestPath: z.string().trim().optional(),
        startDate: z.string().min(1, t('form.errors.startDateRequired')),
        endDate: z.string().min(1, t('form.errors.endDateRequired')),
        endDateTo: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.layout === 'contests') {
          if (!data.contestPath?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('form.errors.contestPathRequired'),
              path: ['contestPath'],
            })
          }
        }
        else if (!data.file?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('form.errors.fileRequired'),
            path: ['file'],
          })
        }
        if (data.endDate < data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('form.errors.endBeforeStart'),
            path: ['endDate'],
          })
        }
        if (data.endDateTo && data.endDateTo < data.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('form.errors.endDateToBeforeEnd'),
            path: ['endDateTo'],
          })
        }
      }),
  )
})

const { defineField, handleSubmit, errors, values, resetForm, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: props.tournament?.title ?? '',
    fullTitle: props.tournament?.fullTitle ?? '',
    sport: props.tournament?.sport ?? '',
    layout: props.tournament?.layout ?? 'legacy',
    file: props.tournament?.file ?? '',
    contestPath: props.tournament?.contestPath ?? '',
    startDate: props.tournament?.startDate ?? '',
    endDate: props.tournament?.endDate ?? '',
    endDateTo: props.tournament?.endDateTo ?? '',
  },
})

watch(defaultSport, (slug) => {
  if (!values.sport && slug) setFieldValue('sport', slug)
})

const [title] = defineField('title')
const [fullTitle] = defineField('fullTitle')
const [sport] = defineField('sport')
const [layout] = defineField('layout')
const [file] = defineField('file')
const [contestPath] = defineField('contestPath')
const [startDate] = defineField('startDate')
const [endDate] = defineField('endDate')
const [endDateTo] = defineField('endDateTo')

const previewId = computed(() => (isEdit.value ? props.tournament!.id : slugify(title.value || '')))

watch(layout, (next, prev) => {
  if (next === prev) return
  if (next === 'contests' && !contestPath.value && previewId.value) {
    setFieldValue('contestPath', `contests/${previewId.value}`)
  }
})

const isDirty = computed(() => {
  const original = props.tournament
  if (!original) return true
  return (
    values.title !== original.title
    || (values.fullTitle || '') !== (original.fullTitle ?? '')
    || values.sport !== original.sport
    || values.layout !== original.layout
    || (values.file || '') !== (original.file ?? '')
    || (values.contestPath || '') !== (original.contestPath ?? '')
    || values.startDate !== original.startDate
    || values.endDate !== original.endDate
    || (values.endDateTo || '') !== (original.endDateTo ?? '')
  )
})

const canSubmit = computed(() => !props.submitting && (!isEdit.value || isDirty.value))

watch(
  () => props.tournament,
  (value) => {
    if (!value) return
    resetForm({
      values: {
        title: value.title,
        fullTitle: value.fullTitle ?? '',
        sport: value.sport,
        layout: value.layout,
        file: value.file ?? '',
        contestPath: value.contestPath ?? '',
        startDate: value.startDate,
        endDate: value.endDate,
        endDateTo: value.endDateTo ?? '',
      },
    })
  },
)

const onSubmit = handleSubmit((formValues) => {
  const nextLayout = formValues.layout
  emit('submit', {
    title: formValues.title,
    fullTitle: formValues.fullTitle?.trim() ?? '',
    sport: formValues.sport,
    layout: nextLayout,
    file: nextLayout === 'legacy' ? (formValues.file?.trim() || null) : null,
    contestPath: nextLayout === 'contests' ? (formValues.contestPath?.trim() || null) : null,
    startDate: formValues.startDate,
    endDate: formValues.endDate,
    endDateTo: formValues.endDateTo?.trim() ? formValues.endDateTo : null,
  })
})
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <slot name="title" />
      </div>
      <div class="flex shrink-0 gap-3">
        <Button type="button" variant="outline" @click="emit('cancel')">
          {{ t('common.cancel') }}
        </Button>
        <Button type="submit" :disabled="!canSubmit">
          {{ submitting ? t('common.saving') : (isEdit ? t('common.save') : t('common.create')) }}
        </Button>
      </div>
    </div>

    <div class="mx-auto max-w-xl space-y-5">
      <div class="space-y-2">
        <Label for="title">{{ t('form.title') }}</Label>
        <Input id="title" v-model="title" />
        <p v-if="errors.title" class="text-sm text-destructive">
          {{ errors.title }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="fullTitle">{{ t('form.fullTitle') }}</Label>
        <Input id="fullTitle" v-model="fullTitle" />
        <p class="text-xs text-muted-foreground">
          {{ t('form.fullTitleHint') }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="id">{{ t('form.id') }}</Label>
        <Input id="id" :model-value="previewId" disabled />
        <p class="text-xs text-muted-foreground">
          {{ isEdit ? t('form.idLocked') : t('form.idHint') }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="sport">{{ t('form.sport') }}</Label>
        <NativeSelect id="sport" v-model="sport">
          <option v-for="item in sportOptions" :key="item.id" :value="item.slug">
            {{ optionLabel(item) }}
          </option>
        </NativeSelect>
        <p v-if="errors.sport" class="text-sm text-destructive">
          {{ errors.sport }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="layout">{{ t('form.layout') }}</Label>
        <NativeSelect id="layout" v-model="layout">
          <option value="legacy">
            {{ t('form.layoutLegacy') }}
          </option>
          <option value="contests">
            {{ t('form.layoutContests') }}
          </option>
        </NativeSelect>
        <p class="text-xs text-muted-foreground">
          {{ t('form.layoutHint') }}
        </p>
      </div>

      <div v-if="layout === 'legacy'" class="space-y-2">
        <Label for="file">{{ t('form.file') }}</Label>
        <Input id="file" v-model="file" placeholder="ucl-26-27.json" />
        <p class="text-xs text-muted-foreground">
          {{ t('form.fileHint') }}
        </p>
        <p v-if="errors.file" class="text-sm text-destructive">
          {{ errors.file }}
        </p>
      </div>

      <div v-else class="space-y-2">
        <Label for="contestPath">{{ t('form.contestPath') }}</Label>
        <Input id="contestPath" v-model="contestPath" placeholder="contests/rpl-26-27" />
        <p class="text-xs text-muted-foreground">
          {{ t('form.contestPathHint') }}
        </p>
        <p v-if="errors.contestPath" class="text-sm text-destructive">
          {{ errors.contestPath }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="startDate">{{ t('form.startDate') }}</Label>
        <DateInput id="startDate" v-model="startDate" />
        <p v-if="errors.startDate" class="text-sm text-destructive">
          {{ errors.startDate }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="endDate">{{ t('form.endDate') }}</Label>
          <DateInput id="endDate" v-model="endDate" />
          <p v-if="errors.endDate" class="text-sm text-destructive">
            {{ errors.endDate }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="endDateTo">{{ t('form.endDateTo') }}</Label>
          <DateInput id="endDateTo" v-model="endDateTo" />
          <p class="text-xs text-muted-foreground">
            {{ t('form.endDateToHint') }}
          </p>
          <p v-if="errors.endDateTo" class="text-sm text-destructive">
            {{ errors.endDateTo }}
          </p>
        </div>
      </div>
    </div>
  </form>
</template>
