<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { SPORT_VALUES, SPORT_LABELS, slugify } from '@/lib/utils'
import type { Tournament } from '~/composables/useTournaments'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import NativeSelect from '@/components/ui/select/NativeSelect.vue'

const props = defineProps<{
  tournament?: Tournament | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: {
    title: string
    sport: typeof SPORT_VALUES[number]
    file: string
    startDate: string
    endDate: string
    endDateTo: string | null
  }]
  cancel: []
}>()

const isEdit = computed(() => Boolean(props.tournament))

const formSchema = toTypedSchema(
  z
    .object({
      title: z.string().trim().min(1, 'Название обязательно'),
      sport: z.enum(SPORT_VALUES, { required_error: 'Выберите спорт' }),
      file: z.string().trim().min(1, 'Имя файла обязательно'),
      startDate: z.string().min(1, 'Дата начала обязательна'),
      endDate: z.string().min(1, 'Дата окончания обязательна'),
      endDateTo: z.string().optional(),
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
    }),
)

const { defineField, handleSubmit, errors, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: props.tournament?.title ?? '',
    sport: props.tournament?.sport ?? SPORT_VALUES[0],
    file: props.tournament?.file ?? '',
    startDate: props.tournament?.startDate ?? '',
    endDate: props.tournament?.endDate ?? '',
    endDateTo: props.tournament?.endDateTo ?? '',
  },
})

const [title] = defineField('title')
const [sport] = defineField('sport')
const [file] = defineField('file')
const [startDate] = defineField('startDate')
const [endDate] = defineField('endDate')
const [endDateTo] = defineField('endDateTo')

const previewId = computed(() => (isEdit.value ? props.tournament!.id : slugify(title.value || '')))

watch(
  () => props.tournament,
  (value) => {
    if (!value) return
    setValues({
      title: value.title,
      sport: value.sport,
      file: value.file,
      startDate: value.startDate,
      endDate: value.endDate,
      endDateTo: value.endDateTo ?? '',
    })
  },
)

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title,
    sport: values.sport,
    file: values.file,
    startDate: values.startDate,
    endDate: values.endDate,
    endDateTo: values.endDateTo?.trim() ? values.endDateTo : null,
  })
})
</script>

<template>
  <form class="mx-auto max-w-xl space-y-5" @submit="onSubmit">
    <div class="space-y-2">
      <Label for="title">Название</Label>
      <Input id="title" v-model="title" />
      <p v-if="errors.title" class="text-sm text-destructive">
        {{ errors.title }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="id">ID (slug)</Label>
      <Input id="id" :model-value="previewId" disabled />
      <p class="text-xs text-muted-foreground">
        {{ isEdit ? 'ID нельзя изменить' : 'Генерируется из названия при создании' }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="sport">Спорт</Label>
      <NativeSelect id="sport" v-model="sport">
        <option v-for="value in SPORT_VALUES" :key="value" :value="value">
          {{ SPORT_LABELS[value] }}
        </option>
      </NativeSelect>
      <p v-if="errors.sport" class="text-sm text-destructive">
        {{ errors.sport }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="file">Файл данных</Label>
      <Input id="file" v-model="file" placeholder="ucl-26-27.json" />
      <p v-if="errors.file" class="text-sm text-destructive">
        {{ errors.file }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="startDate">Дата начала</Label>
        <Input id="startDate" v-model="startDate" type="date" />
        <p v-if="errors.startDate" class="text-sm text-destructive">
          {{ errors.startDate }}
        </p>
      </div>
      <div class="space-y-2">
        <Label for="endDate">Дата окончания</Label>
        <Input id="endDate" v-model="endDate" type="date" />
        <p v-if="errors.endDate" class="text-sm text-destructive">
          {{ errors.endDate }}
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="endDateTo">Окончание до (опционально)</Label>
      <Input id="endDateTo" v-model="endDateTo" type="date" />
      <p class="text-xs text-muted-foreground">
        Верхняя граница возможной даты окончания (например, затяжные плей-офф)
      </p>
      <p v-if="errors.endDateTo" class="text-sm text-destructive">
        {{ errors.endDateTo }}
      </p>
    </div>

    <div class="flex gap-3 pt-2">
      <Button type="submit" :disabled="submitting">
        {{ submitting ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать') }}
      </Button>
      <Button type="button" variant="outline" @click="emit('cancel')">
        Отмена
      </Button>
    </div>
  </form>
</template>
