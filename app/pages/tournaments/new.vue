<script setup lang="ts">
import { useTournamentsStore } from '~/stores/tournaments'
import { toast } from 'vue-sonner'
import TournamentForm from '@/components/tournaments/TournamentForm.vue'

definePageMeta({
  middleware: 'auth',
})

useHead({ title: 'Новый турнир' })

const store = useTournamentsStore()
const submitting = ref(false)

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
    const created = await store.createTournament(payload as Parameters<typeof store.createTournament>[0])
    toast.success('Турнир создан')
    await navigateTo(`/tournaments/${created.id}`)
  }
  catch (err: unknown) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    if (status === 409) {
      toast.error('Турнир с таким id уже существует')
    }
    else {
      toast.error('Не удалось создать турнир')
    }
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
        Новый турнир
      </h1>
      <p class="text-sm text-muted-foreground">
        Заполните поля и сохраните запись
      </p>
    </div>

    <TournamentForm
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="navigateTo('/tournaments')"
    />
  </div>
</template>
