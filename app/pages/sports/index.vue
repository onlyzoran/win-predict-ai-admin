<script setup lang="ts">
import draggable from 'vuedraggable'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { IconGripVertical, IconPlus } from '@onlyzoran/win-predict-ai-icons'
import { SPORT_ICON_KEYS } from '../../../shared/sport'
import type { SportCatalogItem } from '../../../shared/sport'
import { useSportsStore } from '~/stores/sports'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import NativeSelect from '@/components/ui/select/NativeSelect.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const store = useSportsStore()

useHead({ title: () => t('sportsPage.title') })

const ready = ref(false)
const showCreate = ref(false)
const editing = ref<SportCatalogItem | null>(null)
const pendingDelete = ref<SportCatalogItem | null>(null)
const confirmOpen = ref(false)
const submitting = ref(false)
const rows = ref<SportCatalogItem[]>([])

const form = reactive({
  slug: '',
  label: '',
  iconKey: SPORT_ICON_KEYS[0] as string,
  isEnabled: true,
})

watch(
  () => store.items,
  (value) => {
    rows.value = [...value]
  },
  { deep: true },
)

onMounted(async () => {
  try {
    await store.fetchAll()
  }
  catch {
    toast.error(t('sportsPage.loadError'))
  }
  finally {
    ready.value = true
  }
})

function resetForm() {
  form.slug = ''
  form.label = ''
  form.iconKey = SPORT_ICON_KEYS[0]
  form.isEnabled = true
}

function openCreate() {
  editing.value = null
  resetForm()
  showCreate.value = true
}

function openEdit(sport: SportCatalogItem) {
  editing.value = sport
  form.slug = sport.slug
  form.label = sport.label
  form.iconKey = sport.iconKey
  form.isEnabled = sport.isEnabled
  showCreate.value = true
}

function sportLabel(sport: SportCatalogItem) {
  const key = `sports.${sport.slug}`
  const translated = t(key)
  return translated === key ? sport.label : translated
}

function conflictOr(err: unknown, fallbackKey: string) {
  const status = typeof err === 'object' && err && 'statusCode' in err
    ? (err as { statusCode?: number }).statusCode
    : undefined
  const data = typeof err === 'object' && err && 'data' in err
    ? (err as { data?: { message?: string | string[] } }).data
    : undefined
  const message = Array.isArray(data?.message) ? data?.message[0] : data?.message
  toast.error(status === 409 ? (message || t('sportsPage.conflictError')) : t(fallbackKey))
}

async function onSubmit() {
  submitting.value = true
  try {
    if (editing.value) {
      await store.updateSport(editing.value.id, {
        label: form.label,
        iconKey: form.iconKey,
        isEnabled: form.isEnabled,
      })
      toast.success(t('sportsPage.updateSuccess'))
    }
    else {
      await store.createSport({
        slug: form.slug,
        label: form.label,
        iconKey: form.iconKey,
        isEnabled: form.isEnabled,
      })
      toast.success(t('sportsPage.createSuccess'))
    }
    showCreate.value = false
    resetForm()
    editing.value = null
  }
  catch (err) {
    conflictOr(err, editing.value ? 'sportsPage.updateError' : 'sportsPage.createError')
  }
  finally {
    submitting.value = false
  }
}

async function onToggle(sport: SportCatalogItem) {
  try {
    await store.updateSport(sport.id, { isEnabled: !sport.isEnabled })
  }
  catch (err) {
    conflictOr(err, 'sportsPage.updateError')
  }
}

async function onReorder() {
  try {
    await store.reorderSports(rows.value.map((item) => item.id))
    toast.success(t('sportsPage.reorderSuccess'))
  }
  catch (err) {
    conflictOr(err, 'sportsPage.reorderError')
  }
}

function askDelete(sport: SportCatalogItem) {
  pendingDelete.value = sport
  confirmOpen.value = true
}

async function onConfirmDelete() {
  const sport = pendingDelete.value
  if (!sport) return
  try {
    await store.deleteSport(sport.id)
    toast.success(t('sportsPage.deleteSuccess'))
  }
  catch (err) {
    conflictOr(err, 'sportsPage.deleteError')
  }
  finally {
    pendingDelete.value = null
  }
}
</script>

<template>
  <div class="w-full space-y-6 px-4 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ t('sportsPage.title') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ t('sportsPage.subtitle') }}
        </p>
      </div>
      <Button @click="openCreate">
        <IconPlus :size="16" />
        {{ t('sportsPage.create') }}
      </Button>
    </div>

    <div
      v-if="showCreate"
      class="space-y-4 rounded-lg border border-border p-4"
    >
      <h2 class="text-sm font-medium">
        {{ editing ? t('sportsPage.editTitle') : t('sportsPage.createTitle') }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-2">
          <Label for="sport-slug">{{ t('sportsPage.fields.slug') }}</Label>
          <Input
            id="sport-slug"
            v-model="form.slug"
            :disabled="Boolean(editing)"
            placeholder="tennis"
          />
        </div>
        <div class="space-y-2">
          <Label for="sport-label">{{ t('sportsPage.fields.label') }}</Label>
          <Input id="sport-label" v-model="form.label" placeholder="Tennis" />
        </div>
        <div class="space-y-2">
          <Label for="sport-icon">{{ t('sportsPage.fields.iconKey') }}</Label>
          <NativeSelect id="sport-icon" v-model="form.iconKey">
            <option v-for="key in SPORT_ICON_KEYS" :key="key" :value="key">
              {{ key }}
            </option>
          </NativeSelect>
        </div>
        <div class="flex items-end gap-2 pb-1">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="form.isEnabled" type="checkbox" class="size-4 rounded border">
            {{ t('sportsPage.fields.enabled') }}
          </label>
        </div>
      </div>
      <div class="flex gap-2">
        <Button :disabled="submitting" @click="onSubmit">
          {{ submitting ? t('common.saving') : t('common.save') }}
        </Button>
        <Button
          variant="outline"
          @click="showCreate = false; editing = null; resetForm()"
        >
          {{ t('common.cancel') }}
        </Button>
      </div>
    </div>

    <div v-if="!ready || store.loading" class="text-sm text-muted-foreground">
      {{ t('common.loading') }}
    </div>

    <div v-else class="overflow-hidden rounded-md border">
      <table class="w-full caption-bottom text-sm">
        <thead class="[&_tr]:border-b">
          <tr class="border-b">
            <th class="h-10 w-10 px-2 text-left align-middle font-medium text-muted-foreground" />
            <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
              {{ t('sportsPage.columns.slug') }}
            </th>
            <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
              {{ t('sportsPage.columns.label') }}
            </th>
            <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
              {{ t('sportsPage.columns.icon') }}
            </th>
            <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
              {{ t('sportsPage.columns.status') }}
            </th>
            <th class="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
              {{ t('sportsPage.columns.actions') }}
            </th>
          </tr>
        </thead>
        <draggable
          v-model="rows"
          item-key="id"
          tag="tbody"
          handle=".drag-handle"
          class="[&_tr:last-child]:border-0"
          @end="onReorder"
        >
          <template #item="{ element: sport }">
            <tr class="border-b transition-colors hover:bg-muted/50">
              <td class="w-10 p-2 align-middle">
                <button
                  type="button"
                  class="drag-handle inline-flex cursor-grab text-muted-foreground active:cursor-grabbing"
                  :aria-label="t('sportsPage.drag')"
                >
                  <IconGripVertical :size="16" />
                </button>
              </td>
              <td class="p-2 align-middle font-mono text-sm">
                {{ sport.slug }}
              </td>
              <td class="p-2 align-middle">
                {{ sportLabel(sport) }}
              </td>
              <td class="p-2 align-middle font-mono text-xs text-muted-foreground">
                {{ sport.iconKey }}
              </td>
              <td class="p-2 align-middle">
                <Badge :variant="sport.isEnabled ? 'default' : 'secondary'">
                  {{ sport.isEnabled ? t('sportsPage.enabled') : t('sportsPage.disabled') }}
                </Badge>
              </td>
              <td class="space-x-1 p-2 text-right align-middle">
                <Button variant="ghost" size="sm" @click="onToggle(sport)">
                  {{ sport.isEnabled ? t('sportsPage.disable') : t('sportsPage.enable') }}
                </Button>
                <Button variant="ghost" size="sm" @click="openEdit(sport)">
                  {{ t('common.edit') }}
                </Button>
                <Button variant="ghost" size="sm" @click="askDelete(sport)">
                  {{ t('common.delete') }}
                </Button>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
      <div v-if="rows.length === 0" class="p-8 text-center text-sm text-muted-foreground">
        {{ t('sportsPage.empty') }}
      </div>
    </div>

    <AlertDialog
      v-model:open="confirmOpen"
      :title="t('sportsPage.deleteTitle')"
      :description="t('sportsPage.deleteDescription', { slug: pendingDelete?.slug ?? '' })"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      destructive
      @confirm="onConfirmDelete"
    />
  </div>
</template>
