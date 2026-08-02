<script setup lang="ts">
import { useTournamentsStore } from '~/stores/tournaments'
import { toast } from 'vue-sonner'
import TournamentForm from '@/components/tournaments/TournamentForm.vue'
import type { Tournament } from '~/composables/useTournaments'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const store = useTournamentsStore()
const api = useTournamentsApi()
const submitting = ref(false)
const loading = ref(true)
const tournament = ref<Tournament | null>(null)

const id = computed(() => String(route.params.id))

useHead({
  title: computed(() => tournament.value?.title || 'Редактирование'),
})

onMounted(async () => {
  try {
    tournament.value = await api.getById(id.value)
  }
  catch {
    toast.error('Турнир не найден')
    await navigateTo('/tournaments')
  }
  finally {
    loading.value = false
  }
})

async function onSubmit(payload: {
  title: string
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
    toast.success('Изменения сохранены')
  }
  catch {
    toast.error('Не удалось сохранить изменения')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4 py-8">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        Редактирование турнира
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ tournament?.id || id }}
      </p>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground">
      Загрузка…
    </div>

    <TournamentForm
      v-else-if="tournament"
      :tournament="tournament"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="navigateTo('/tournaments')"
    />
  </div>
</template>
