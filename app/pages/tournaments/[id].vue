<script setup lang="ts">
import { useTournamentsStore } from '~/stores/tournaments'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { IconArrowLeft } from '@onlyzoran/win-predict-ai-icons'
import Button from '@/components/ui/button/Button.vue'
import TournamentForm from '@/components/tournaments/TournamentForm.vue'
import type { Tournament } from '../../../shared/tournament'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()
const store = useTournamentsStore()
const api = useTournamentsApi()
const submitting = ref(false)
const loading = ref(true)
const tournament = ref<Tournament | null>(null)

const id = computed(() => String(route.params.id))

useHead({
  title: computed(() => tournament.value?.title || t('tournaments.editFallbackTitle')),
})

onMounted(async () => {
  try {
    tournament.value = await api.getById(id.value)
  }
  catch {
    toast.error(t('tournaments.notFound'))
    await navigateTo('/tournaments')
  }
  finally {
    loading.value = false
  }
})

async function onSubmit(payload: {
  title: string
  fullTitle: string
  sport: string
  file: string
  startDate: string
  endDate: string
  endDateTo: string | null
}) {
  submitting.value = true
  try {
    tournament.value = await store.updateTournament(
      id.value,
      payload as Parameters<typeof store.updateTournament>[1],
    )
    toast.success(t('tournaments.updateSuccess'))
  }
  catch (err: unknown) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    toast.error(status === 409 ? t('tournaments.conflictError') : t('tournaments.updateError'))
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4 py-8">
    <Button
      variant="ghost"
      size="sm"
      class="-ml-3 text-muted-foreground"
      @click="navigateTo('/tournaments')"
    >
      <IconArrowLeft :size="16" />
      {{ t('tournaments.backToList') }}
    </Button>

    <div v-if="loading" class="text-sm text-muted-foreground">
      {{ t('common.loading') }}
    </div>

    <TournamentForm
      v-else-if="tournament"
      :tournament="tournament"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="navigateTo('/tournaments')"
    >
      <template #title>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ t('tournaments.editTitle') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ tournament.id }}
        </p>
      </template>
    </TournamentForm>
  </div>
</template>
