<script setup lang="ts">
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/button/Button.vue'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()

const { t } = useI18n()
</script>

<template>
  <AlertDialogRoot v-model:open="open">
    <AlertDialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <AlertDialogContent
        :class="cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
        )"
      >
        <div class="flex flex-col space-y-2 text-center sm:text-left">
          <AlertDialogTitle class="text-lg font-semibold">
            {{ title }}
          </AlertDialogTitle>
          <AlertDialogDescription v-if="description" class="text-sm text-muted-foreground">
            {{ description }}
          </AlertDialogDescription>
        </div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel as-child>
            <Button variant="outline">
              {{ props.cancelLabel || t('common.cancel') }}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button
              :variant="destructive ? 'destructive' : 'default'"
              @click="emit('confirm')"
            >
              {{ props.confirmLabel || t('common.confirm') }}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
