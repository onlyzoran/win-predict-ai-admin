<script setup lang="ts">
import { IconPencil, IconTrash } from '@onlyzoran/win-predict-ai-icons'
import { useI18n } from 'vue-i18n'
import type { Tournament } from '../../../shared/tournament'
import Button from '@/components/ui/button/Button.vue'
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue'

const props = defineProps<{
  tournament: Tournament
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const { t } = useI18n()
const router = useRouter()
const confirmOpen = ref(false)

const editTo = computed(() => `/tournaments/${props.tournament.id}`)
const editHref = computed(() => router.resolve(editTo.value).href)
</script>

<template>
  <div class="flex items-center justify-end gap-1">
    <Button
      as="a"
      variant="ghost"
      size="icon"
      :href="editHref"
      @click.prevent="navigateTo(editTo)"
    >
      <IconPencil :size="16" />
      <span class="sr-only">{{ t('common.edit') }}</span>
    </Button>

    <Button variant="ghost" size="icon" @click="confirmOpen = true">
      <IconTrash :size="16" class="text-destructive" />
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
