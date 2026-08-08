<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { IconPlus } from '@onlyzoran/win-predict-ai-icons'
import type { AdminUser } from '../../../shared/user'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

definePageMeta({
  middleware: 'auth',
})

const { t, locale } = useI18n()
const { user, ensureHydrated } = useAuth()
const { items, loading, fetchAll, create, setActive } = useAdmins()

useHead({ title: () => t('admins.title') })

await ensureHydrated()

const ready = ref(false)
const email = ref('')
const submitting = ref(false)
const pendingDeactivate = ref<AdminUser | null>(null)
const confirmOpen = ref(false)

const dateFormatter = computed(() => {
  void locale.value
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

function formatTs(value: number | null) {
  if (!value) return t('admins.never')
  return dateFormatter.value.format(value)
}

onMounted(async () => {
  try {
    await fetchAll()
  }
  catch {
    toast.error(t('admins.loadError'))
  }
  finally {
    ready.value = true
  }
})

async function onCreate() {
  submitting.value = true
  try {
    await create(email.value)
    email.value = ''
    toast.success(t('admins.createSuccess'))
  }
  catch (err) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    toast.error(status === 409 ? t('admins.createConflict') : t('admins.createError'))
  }
  finally {
    submitting.value = false
  }
}

function askDeactivate(admin: AdminUser) {
  pendingDeactivate.value = admin
  confirmOpen.value = true
}

async function onConfirmDeactivate() {
  const admin = pendingDeactivate.value
  if (!admin) return
  try {
    await setActive(admin.id, false)
    toast.success(t('admins.deactivateSuccess'))
  }
  catch (err) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    toast.error(
      status === 400 ? t('admins.deactivateLastError') : t('admins.deactivateError'),
    )
  }
  finally {
    pendingDeactivate.value = null
  }
}

async function onActivate(admin: AdminUser) {
  try {
    await setActive(admin.id, true)
    toast.success(t('admins.activateSuccess'))
  }
  catch {
    toast.error(t('admins.activateError'))
  }
}

function isSelf(admin: AdminUser) {
  return user.value?.id === admin.id
}
</script>

<template>
  <div class="w-full space-y-6 px-4 py-8">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ t('admins.title') }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t('admins.subtitle') }}
      </p>
    </div>

    <form
      class="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
      @submit.prevent="onCreate"
    >
      <div class="min-w-0 flex-1 space-y-2">
        <Label for="admin-email">{{ t('admins.email') }}</Label>
        <Input
          id="admin-email"
          v-model="email"
          type="email"
          autocomplete="off"
          required
          :placeholder="t('admins.emailPlaceholder')"
        />
      </div>
      <Button type="submit" :disabled="submitting">
        <IconPlus :size="16" />
        {{ submitting ? t('common.saving') : t('admins.add') }}
      </Button>
    </form>

    <div v-if="!ready || loading" class="text-sm text-muted-foreground">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="!items.length" class="text-sm text-muted-foreground">
      {{ t('admins.empty') }}
    </div>

    <div v-else class="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ t('admins.columns.email') }}</TableHead>
            <TableHead>{{ t('admins.columns.status') }}</TableHead>
            <TableHead>{{ t('admins.columns.created') }}</TableHead>
            <TableHead>{{ t('admins.columns.lastLogin') }}</TableHead>
            <TableHead class="text-right">
              {{ t('admins.columns.actions') }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="admin in items" :key="admin.id">
            <TableCell>
              <div class="font-medium">
                {{ admin.email }}
              </div>
              <div v-if="isSelf(admin)" class="text-xs text-muted-foreground">
                {{ t('admins.you') }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="admin.isActive ? 'default' : 'secondary'">
                {{ admin.isActive ? t('admins.statusActive') : t('admins.statusInactive') }}
              </Badge>
            </TableCell>
            <TableCell class="whitespace-nowrap text-muted-foreground">
              {{ formatTs(admin.createdAt) }}
            </TableCell>
            <TableCell class="whitespace-nowrap text-muted-foreground">
              {{ formatTs(admin.lastLoginAt) }}
            </TableCell>
            <TableCell class="text-right">
              <Button
                v-if="admin.isActive"
                variant="outline"
                size="sm"
                :disabled="isSelf(admin)"
                @click="askDeactivate(admin)"
              >
                {{ t('admins.deactivate') }}
              </Button>
              <Button
                v-else
                variant="outline"
                size="sm"
                @click="onActivate(admin)"
              >
                {{ t('admins.activate') }}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <AlertDialog
      v-model:open="confirmOpen"
      :title="t('admins.deactivateConfirmTitle')"
      :description="t('admins.deactivateConfirmDescription', { email: pendingDeactivate?.email || '' })"
      :confirm-label="t('admins.deactivate')"
      :cancel-label="t('common.cancel')"
      destructive
      @confirm="onConfirmDeactivate"
    />
  </div>
</template>
