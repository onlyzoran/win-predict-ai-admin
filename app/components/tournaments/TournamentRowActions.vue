<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import type { Tournament } from '~/utils/githubLeagues'
import Button from '@/components/ui/button/Button.vue'
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue'

const props = defineProps<{
  tournament: Tournament
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const { t } = useI18n()
const confirmOpen = ref(false)
</script>

<template>
  <div class="flex items-center justify-end gap-1">
    <Button
      as="a"
      variant="ghost"
      size="icon"
      :href="`/tournaments/${props.tournament.id}`"
      @click.prevent="navigateTo(`/tournaments/${props.tournament.id}`)"
    >
      <Pencil class="size-4" />
      <span class="sr-only">{{ t('common.edit') }}</span>
    </Button>

    <Button variant="ghost" size="icon" @click="confirmOpen = true">
      <Trash2 class="size-4 text-destructive" />
      <span class="sr-only">{{ t('common.delete') }}</span>
    </Button>

    <AlertDialog
      v-model:open="confirmOpen"
      :title="t('tournaments.deleteConfirmTitle')"
      :description="t('tournaments.deleteConfirmDescription', { title: tournament.title })"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      destructive
      @confirm="emit('delete', tournament.id)"
    />
  </div>
</template>
