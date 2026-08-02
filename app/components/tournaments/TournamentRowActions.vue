<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import type { Tournament } from '~/composables/useTournaments'
import Button from '@/components/ui/button/Button.vue'
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue'

const props = defineProps<{
  tournament: Tournament
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

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
      <span class="sr-only">Редактировать</span>
    </Button>

    <Button variant="ghost" size="icon" @click="confirmOpen = true">
      <Trash2 class="size-4 text-destructive" />
      <span class="sr-only">Удалить</span>
    </Button>

    <AlertDialog
      v-model:open="confirmOpen"
      title="Удалить турнир?"
      :description="`«${tournament.title}» будет удалён без возможности восстановления.`"
      confirm-label="Удалить"
      destructive
      @confirm="emit('delete', tournament.id)"
    />
  </div>
</template>
