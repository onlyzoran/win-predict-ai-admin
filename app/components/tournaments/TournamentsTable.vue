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
import { useI18n } from 'vue-i18n'
import { GripVertical } from '@lucide/vue'
import type { Tournament } from '~/utils/githubLeagues'
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

const { t, locale } = useI18n()
const sorting = ref<SortingState>([])
const rows = ref<Tournament[]>([...props.data])

watch(
  () => props.data,
  (value) => {
    rows.value = [...value]
  },
  { deep: true },
)

const columns = computed<ColumnDef<Tournament>[]>(() => {
  void locale.value
  return [
    { id: 'drag', header: '', enableSorting: false },
    { accessorKey: 'id', header: t('tournaments.columns.id') },
    { accessorKey: 'title', header: t('tournaments.columns.title') },
    { accessorKey: 'fullTitle', header: t('tournaments.columns.fullTitle') },
    { accessorKey: 'sport', header: t('tournaments.columns.sport') },
    { accessorKey: 'startDate', header: t('tournaments.columns.start') },
    { accessorKey: 'endDate', header: t('tournaments.columns.end') },
    { accessorKey: 'popularPriority', header: t('tournaments.columns.priority') },
    { id: 'actions', header: '', enableSorting: false },
  ]
})

const table = useVueTable({
  get data() {
    return rows.value
  },
  get columns() {
    return columns.value
  },
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

const isSorting = computed(() => sorting.value.length > 0)
const canDrag = computed(() => Boolean(props.dragEnabled) && !isSorting.value)

const displayRows = computed({
  get() {
    const source = rows.value
    if (!isSorting.value) {
      return source
    }
    return table.getRowModel().rows.map((row) => row.original)
  },
  set(value: Tournament[]) {
    rows.value = value
  },
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
        v-model="displayRows"
        item-key="id"
        tag="tbody"
        handle=".drag-handle"
        :disabled="!canDrag"
        class="[&_tr:last-child]:border-0"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <tr class="border-b transition-colors hover:bg-muted/50">
            <td class="w-10 p-2 align-middle">
              <button
                type="button"
                class="drag-handle inline-flex cursor-grab text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!canDrag"
                :aria-label="t('tournaments.drag')"
              >
                <GripVertical class="size-4" />
              </button>
            </td>
            <td class="p-2 align-middle font-mono text-sm">
              {{ element.id }}
            </td>
            <td class="p-2 align-middle font-medium">
              {{ element.title }}
            </td>
            <td class="p-2 align-middle text-muted-foreground">
              {{ element.fullTitle || '—' }}
            </td>
            <td class="p-2 align-middle">
              <Badge variant="secondary">
                {{ t(`sports.${element.sport}`) }}
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
      {{ t('tournaments.empty') }}
    </div>
  </div>
</template>
