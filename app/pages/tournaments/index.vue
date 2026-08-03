<script setup lang="ts">
import { useTournamentsStore } from '~/stores/tournaments'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { Plus } from '@lucide/vue'
import { SPORT_VALUES } from '@/lib/utils'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import NativeSelect from '@/components/ui/select/NativeSelect.vue'
import TournamentsTable from '@/components/tournaments/TournamentsTable.vue'
import type { Sport } from '../../../shared/tournament'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()

useHead({ title: () => t('tournaments.title') })

const store = useTournamentsStore()
const ready = ref(false)

onMounted(async () => {
  try {
    await store.fetchAll()
  }
  catch {
    toast.error(t('tournaments.loadError'))
  }
  finally {
    ready.value = true
  }
})

function conflictOr(err: unknown, fallbackKey: string) {
  const status = typeof err === 'object' && err && 'statusCode' in err
    ? (err as { statusCode?: number }).statusCode
    : undefined
  toast.error(status === 409 ? t('tournaments.conflictError') : t(fallbackKey))
}

async function onReorder(ids: string[]) {
  try {
    await store.reorderTournaments(ids)
    toast.success(t('tournaments.reorderSuccess'))
  }
  catch (err) {
    conflictOr(err, 'tournaments.reorderError')
  }
}

async function onDelete(id: string) {
  try {
    await store.deleteTournament(id)
    toast.success(t('tournaments.deleteSuccess'))
  }
  catch (err) {
    conflictOr(err, 'tournaments.deleteError')
  }
}

const sportModel = computed({
  get: () => store.sportFilter,
  set: (value: string) => {
    store.sportFilter = (value || 'all') as Sport | 'all'
  },
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ t('tournaments.title') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ t('tournaments.subtitle') }}
        </p>
      </div>
      <Button @click="navigateTo('/tournaments/new')">
        <Plus class="size-4" />
        {{ t('tournaments.create') }}
      </Button>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <Input
        v-model="store.searchQuery"
        class="sm:max-w-xs"
        :placeholder="t('tournaments.searchPlaceholder')"
      />
      <NativeSelect v-model="sportModel" class="sm:max-w-xs">
        <option value="all">
          {{ t('sports.all') }}
        </option>
        <option v-for="sport in SPORT_VALUES" :key="sport" :value="sport">
          {{ t(`sports.${sport}`) }}
        </option>
      </NativeSelect>
    </div>

    <div v-if="!ready || store.loading" class="text-sm text-muted-foreground">
      {{ t('common.loading') }}
    </div>

    <TournamentsTable
      v-else
      :data="store.filteredItems"
      :drag-enabled="store.sportFilter === 'all' && !store.searchQuery.trim()"
      @reorder="onReorder"
      @delete="onDelete"
    />
  </div>
</template>
