<script setup lang="ts">
import { LocaleSwitcher, Separator, ThemeToggle } from '@onlyzoran/win-predict-ai-ui'
import { IconBrandGithub } from '@onlyzoran/win-predict-ai-icons'
import { Palette } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { locale, localeLabels, locales, setLocale, type Locale } from '~/i18n'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'

const { t } = useI18n()
const route = useRoute()

function onLocaleUpdate(code: string) {
  if (locales.includes(code as Locale)) setLocale(code as Locale)
}

interface BreadcrumbEntry {
  label: string
  to?: string
}

const breadcrumbs = computed((): BreadcrumbEntry[] => {
  const path = route.path

  if (path.startsWith('/tournaments')) {
    const items: BreadcrumbEntry[] = [
      { label: t('nav.tournaments'), to: '/tournaments' },
    ]
    if (path === '/tournaments/new') {
      items.push({ label: t('tournaments.newTitle') })
    }
    else if (path !== '/tournaments') {
      items.push({ label: t('tournaments.editFallbackTitle') })
    }
    return items
  }

  if (path.startsWith('/sports')) {
    return [{ label: t('nav.sports') }]
  }

  if (path.startsWith('/admins')) {
    return [{ label: t('nav.admins') }]
  }

  if (path.startsWith('/settings/appearance')) {
    return [{ label: t('appearance.title') }]
  }

  return [{ label: t('app.title') }]
})
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
    <div class="flex flex-1 items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator
        orientation="vertical"
        class="mr-2 h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <template v-for="(item, index) in breadcrumbs" :key="item.label">
            <BreadcrumbSeparator v-if="index > 0" class="hidden md:block" />
            <BreadcrumbItem :class="index < breadcrumbs.length - 1 ? 'hidden md:block' : undefined">
              <BreadcrumbLink v-if="item.to" as-child>
                <NuxtLink :to="item.to">
                  {{ item.label }}
                </NuxtLink>
              </BreadcrumbLink>
              <BreadcrumbPage v-else>
                {{ item.label }}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
      <div class="ml-auto flex items-center gap-1">
        <LocaleSwitcher
          :model-value="locale"
          :locales="locales"
          :labels="localeLabels"
          :aria-label="t('language.label')"
          @update:model-value="onLocaleUpdate"
        />
        <ThemeToggle
          :aria-label-light="t('theme.switchToLight')"
          :aria-label-dark="t('theme.switchToDark')"
        />
        <NuxtLink
          to="/settings/appearance"
          class="inline-flex items-center gap-1.5 rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-2 sm:py-1.5"
          :aria-label="t('appearance.openSettings')"
        >
          <Palette class="size-4" aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('appearance.shortLabel') }}</span>
        </NuxtLink>
        <span
          class="mx-1 h-5 w-px bg-border"
          aria-hidden="true"
        />
        <a
          href="https://github.com/onlyzoran/win-predict-ai-admin"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="GitHub"
        >
          <IconBrandGithub :size="16" />
        </a>
      </div>
    </div>
  </header>
</template>
