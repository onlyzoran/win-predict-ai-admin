<script setup lang="ts">
import { IconBallFootball } from '@onlyzoran/win-predict-ai-icons'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@onlyzoran/win-predict-ai-ui'
import { useI18n } from 'vue-i18n'

type ResultStatus = 'final' | 'intermediate'

interface MatchResultCard {
  id: string
  leagueKey: string
  matchKey: string
  status: ResultStatus
  statusKey: string
  score: string
  detailKey: string
}

const { t } = useI18n()

const cards: MatchResultCard[] = [
  {
    id: 'epl-final',
    leagueKey: 'appearance.resultPreview.cards.eplFinal.league',
    matchKey: 'appearance.resultPreview.cards.eplFinal.match',
    status: 'final',
    statusKey: 'appearance.resultPreview.statusFinal',
    score: '2 : 1',
    detailKey: 'appearance.resultPreview.cards.eplFinal.detail',
  },
  {
    id: 'laliga-final',
    leagueKey: 'appearance.resultPreview.cards.laligaFinal.league',
    matchKey: 'appearance.resultPreview.cards.laligaFinal.match',
    status: 'final',
    statusKey: 'appearance.resultPreview.statusFinal',
    score: '1 : 1',
    detailKey: 'appearance.resultPreview.cards.laligaFinal.detail',
  },
  {
    id: 'bundesliga-live',
    leagueKey: 'appearance.resultPreview.cards.bundesligaLive.league',
    matchKey: 'appearance.resultPreview.cards.bundesligaLive.match',
    status: 'intermediate',
    statusKey: 'appearance.resultPreview.statusIntermediate',
    score: '1 : 0',
    detailKey: 'appearance.resultPreview.cards.bundesligaLive.detail',
  },
  {
    id: 'seriea-live',
    leagueKey: 'appearance.resultPreview.cards.serieaLive.league',
    matchKey: 'appearance.resultPreview.cards.serieaLive.match',
    status: 'intermediate',
    statusKey: 'appearance.resultPreview.statusIntermediate',
    score: '0 : 0',
    detailKey: 'appearance.resultPreview.cards.serieaLive.detail',
  },
]

function statusBadgeClass(status: ResultStatus) {
  return status === 'final'
    ? 'border border-chart-1/30 bg-chart-1/15 text-primary'
    : 'border border-chart-2/35 bg-chart-2/20 text-foreground'
}

function cardAccentClass(status: ResultStatus) {
  return status === 'final' ? 'border-l-chart-1' : 'border-l-chart-2'
}
</script>

<template>
  <div class="grid w-full gap-4 sm:grid-cols-2">
    <Card
      v-for="card in cards"
      :key="card.id"
      class="overflow-hidden border-l-4 p-0"
      :class="cardAccentClass(card.status)"
    >
      <CardHeader class="gap-2 px-4 pt-4 pb-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <CardDescription class="flex items-center gap-1.5 text-xs">
              <IconBallFootball aria-hidden="true" class="size-3.5 shrink-0" />
              {{ t(card.leagueKey) }}
            </CardDescription>
            <CardTitle class="mt-1 text-base leading-snug">
              {{ t(card.matchKey) }}
            </CardTitle>
          </div>
          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
            :class="statusBadgeClass(card.status)"
          >
            <span
              class="size-2 rounded-sm"
              :class="card.status === 'final' ? 'bg-chart-1' : 'bg-chart-2'"
              aria-hidden="true"
            />
            {{ t(card.statusKey) }}
          </span>
        </div>
      </CardHeader>
      <Separator />
      <CardContent class="flex flex-col gap-1 px-4 py-3">
        <p class="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {{ card.score }}
        </p>
        <p class="text-sm text-muted-foreground">
          {{ t(card.detailKey) }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
