<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { IconPlus } from '@onlyzoran/win-predict-ai-icons'
import type { AdminUser } from '../../../shared/user'
import { Badge, Button } from '@onlyzoran/win-predict-ai-ui'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
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
const { user, isSuperAdmin, ensureHydrated } = useAuth()
const { items, loading, fetchAll, create, remove } = useAdmins()

useHead({ title: () => t('admins.title') })

await ensureHydrated()

const ready = ref(false)
const email = ref('')
const submitting = ref(false)
const pendingDelete = ref<AdminUser | null>(null)
const confirmOpen = ref(false)

const dateFormatter = computed(() => {
  void locale.value
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

const activeSuperadminCount = computed(
  () => items.value.filter((item) => item.isActive && item.role === 'superadmin').length,
)

function formatTs(value: number | null) {
  if (!value) return t('admins.never')
  return dateFormatter.value.format(value)
}

function isSelf(admin: AdminUser) {
  return user.value?.id === admin.id
}

function canDelete(admin: AdminUser) {
  if (!isSuperAdmin.value || isSelf(admin)) return false
  if (admin.role === 'superadmin' && activeSuperadminCount.value <= 1) return false
  return true
}

function roleLabel(admin: AdminUser) {
  return admin.role === 'superadmin' ? t('admins.roleSuperadmin') : t('admins.roleAdmin')
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
    toast.error(
      status === 403
        ? t('admins.forbidden')
        : status === 409
          ? t('admins.createConflict')
          : t('admins.createError'),
    )
  }
  finally {
    submitting.value = false
  }
}

function askDelete(admin: AdminUser) {
  pendingDelete.value = admin
  confirmOpen.value = true
}

async function onConfirmDelete() {
  const admin = pendingDelete.value
  if (!admin) return
  try {
    await remove(admin.id)
    toast.success(t('admins.deleteSuccess'))
  }
  catch (err) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    toast.error(
      status === 403
        ? t('admins.forbidden')
        : status === 400
          ? t('admins.deleteLastError')
          : t('admins.deleteError'),
    )
  }
  finally {
    pendingDelete.value = null
  }
}
</script>

<template>
  <div class="w-full space-y-6 px-4 py-8">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ t('admins.title') }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ isSuperAdmin ? t('admins.subtitle') : t('admins.subtitleReadonly') }}
      </p>
    </div>

    <form
      v-if="isSuperAdmin"
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
            <TableHead>{{ t('admins.columns.role') }}</TableHead>
            <TableHead>{{ t('admins.columns.status') }}</TableHead>
            <TableHead>{{ t('admins.columns.created') }}</TableHead>
            <TableHead>{{ t('admins.columns.lastLogin') }}</TableHead>
            <TableHead v-if="isSuperAdmin" class="text-right">
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
              <Badge :variant="admin.role === 'superadmin' ? 'default' : 'secondary'">
                {{ roleLabel(admin) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="admin.isActive ? 'outline' : 'secondary'">
                {{ admin.isActive ? t('admins.statusActive') : t('admins.statusInactive') }}
              </Badge>
            </TableCell>
            <TableCell class="whitespace-nowrap text-muted-foreground">
              {{ formatTs(admin.createdAt) }}
            </TableCell>
            <TableCell class="whitespace-nowrap text-muted-foreground">
              {{ formatTs(admin.lastLoginAt) }}
            </TableCell>
            <TableCell v-if="isSuperAdmin" class="text-right">
              <Button
                variant="outline"
                size="sm"
                :disabled="!canDelete(admin)"
                @click="askDelete(admin)"
              >
                {{ t('common.delete') }}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <AlertDialog
      v-model:open="confirmOpen"
      :title="t('admins.deleteConfirmTitle')"
      :description="t('admins.deleteConfirmDescription', { email: pendingDelete?.email || '' })"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      destructive
      @confirm="onConfirmDelete"
    />
  </div>
</template>
