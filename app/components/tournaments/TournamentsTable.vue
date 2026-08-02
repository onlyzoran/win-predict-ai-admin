<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import draggable from 'vuedraggable'
import { GripVertical } from '@lucide/vue'
import { SPORT_LABELS } from '@/lib/utils'
import type { Tournament } from '~/composables/useTournaments'
import Badge from '@/components/ui/badge/Badge.vue'
import TournamentRowActions from '@/components/tournaments/TournamentRowActions.vue'

const props = defineProps<{
  data: Tournament[]
  dragEnabled?: boolean
}>()

const emit = defineEmits<{
  reorder: [ids: string[]]
  delete: [id: string]
}>()

const sorting = ref<SortingState>([])
const rows = ref<Tournament[]>([...props.data])

watch(
  () => props.data,
  (value) => {
    rows.value = [...value]
  },
  { deep: true },
)

const columns: ColumnDef<Tournament>[] = [
  { id: 'drag', header: '', enableSorting: false },
  { accessorKey: 'title', header: 'Название' },
  { accessorKey: 'sport', header: 'Спорт' },
  { accessorKey: 'startDate', header: 'Начало' },
  { accessorKey: 'endDate', header: 'Окончание' },
  { accessorKey: 'popularPriority', header: 'Приоритет' },
  { id: 'actions', header: '', enableSorting: false },
]

const table = useVueTable({
  get data() {
    return rows.value
  },
  columns,
  state: {
    get sorting() {
      return sorting.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
})

function onDragEnd() {
  emit('reorder', rows.value.map((item) => item.id))
}
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <table class="w-full caption-bottom text-sm">
      <thead class="[&_tr]:border-b">
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="border-b"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
            :class="header.column.id === 'drag' ? 'w-10' : undefined"
          >
            <button
              v-if="header.column.getCanSort()"
              type="button"
              class="inline-flex items-center gap-1 hover:text-foreground"
              @click="header.column.toggleSorting()"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <span v-if="header.column.getIsSorted() === 'asc'">↑</span>
              <span v-else-if="header.column.getIsSorted() === 'desc'">↓</span>
            </button>
            <FlexRender
              v-else-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>

      <draggable
        v-model="rows"
        item-key="id"
        tag="tbody"
        handle=".drag-handle"
        :disabled="!dragEnabled"
        class="[&_tr:last-child]:border-0"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <tr class="border-b transition-colors hover:bg-muted/50">
            <td class="w-10 p-2 align-middle">
              <button
                type="button"
                class="drag-handle inline-flex cursor-grab text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!dragEnabled"
                aria-label="Перетащить"
              >
                <GripVertical class="size-4" />
              </button>
            </td>
            <td class="p-2 align-middle font-medium">
              {{ element.title }}
            </td>
            <td class="p-2 align-middle">
              <Badge variant="secondary">
                {{ SPORT_LABELS[element.sport] }}
              </Badge>
            </td>
            <td class="p-2 align-middle">
              {{ element.startDate }}
            </td>
            <td class="p-2 align-middle">
              {{ element.endDate }}
              <span v-if="element.endDateTo" class="text-muted-foreground">
                → {{ element.endDateTo }}
              </span>
            </td>
            <td class="p-2 align-middle">
              {{ element.popularPriority }}
            </td>
            <td class="p-2 align-middle">
              <TournamentRowActions
                :tournament="element"
                @delete="emit('delete', $event)"
              />
            </td>
          </tr>
        </template>
      </draggable>
    </table>

    <div v-if="rows.length === 0" class="p-8 text-center text-sm text-muted-foreground">
      Турниры не найдены
    </div>
  </div>
</template>
