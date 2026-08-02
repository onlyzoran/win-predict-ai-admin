<script setup lang="ts">
import { useTournamentsStore } from '~/stores/tournaments'
import { toast } from 'vue-sonner'
import { LogOut, Plus } from '@lucide/vue'
import { SPORT_VALUES, SPORT_LABELS } from '@/lib/utils'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import NativeSelect from '@/components/ui/select/NativeSelect.vue'
import TournamentsTable from '@/components/tournaments/TournamentsTable.vue'
import type { Sport } from '../../../shared/tournament'

definePageMeta({
  middleware: 'auth',
})

useHead({ title: 'Турниры' })

const store = useTournamentsStore()
const { signOut, data: session } = useAuth()
const ready = ref(false)

onMounted(async () => {
  try {
    await store.fetchAll()
  }
  catch {
    toast.error('Не удалось загрузить турниры')
  }
  finally {
    ready.value = true
  }
})

async function onReorder(ids: string[]) {
  try {
    await store.reorderTournaments(ids)
    toast.success('Порядок обновлён')
  }
  catch {
    toast.error('Не удалось сохранить порядок')
  }
}

async function onDelete(id: string) {
  try {
    await store.deleteTournament(id)
    toast.success('Турнир удалён')
  }
  catch {
    toast.error('Не удалось удалить турнир')
  }
}

async function logout() {
  await signOut({ callbackUrl: '/login' })
}

const sportModel = computed({
  get: () => store.sportFilter,
  set: (value: string) => {
    store.sportFilter = (value || 'all') as Sport | 'all'
  },
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Турниры
        </h1>
        <p class="text-sm text-muted-foreground">
          Управление списком турниров · {{ session?.user?.email }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="logout">
          <LogOut class="size-4" />
          Выйти
        </Button>
        <Button @click="navigateTo('/tournaments/new')">
          <Plus class="size-4" />
          Создать турнир
        </Button>
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <Input
        v-model="store.searchQuery"
        class="sm:max-w-xs"
        placeholder="Поиск по названию…"
      />
      <NativeSelect v-model="sportModel" class="sm:max-w-xs">
        <option value="all">
          Все виды спорта
        </option>
        <option v-for="sport in SPORT_VALUES" :key="sport" :value="sport">
          {{ SPORT_LABELS[sport] }}
        </option>
      </NativeSelect>
    </div>

    <div v-if="!ready || store.loading" class="text-sm text-muted-foreground">
      Загрузка…
    </div>

    <TournamentsTable
      v-else
      :data="store.filteredItems"
      :drag-enabled="store.sportFilter === 'all' && !store.searchQuery.trim()"
      @reorder="onReorder"
      @delete="onDelete"
    />
  </div>
</template>
