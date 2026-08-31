<script setup lang="ts">
import { useTournamentsStore } from '~/stores/tournaments'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { IconArrowLeft } from '@onlyzoran/win-predict-ai-icons'
import { Button } from '@onlyzoran/win-predict-ai-ui'
import TournamentForm from '@/components/tournaments/TournamentForm.vue'
import type { TournamentFormPayload } from '@/components/tournaments/TournamentForm.vue'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()

useHead({ title: () => t('tournaments.newTitle') })

const store = useTournamentsStore()
const submitting = ref(false)

async function onSubmit(payload: TournamentFormPayload) {
  submitting.value = true
  try {
    const created = await store.createTournament(payload as Parameters<typeof store.createTournament>[0])
    toast.success(t('tournaments.createSuccess'))
    await navigateTo(`/tournaments/${created.id}`)
  }
  catch (err: unknown) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    if (status === 409) {
      toast.error(t('tournaments.createConflict'))
    }
    else {
      toast.error(t('tournaments.createError'))
    }
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

    <TournamentForm
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="navigateTo('/tournaments')"
    >
      <template #title>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ t('tournaments.newTitle') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ t('tournaments.newSubtitle') }}
        </p>
      </template>
    </TournamentForm>
  </div>
</template>
