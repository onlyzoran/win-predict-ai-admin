<script setup lang="ts">
import {
  GalleryVerticalEnd,
  Shield,
  Trophy,
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const { t } = useI18n()
const route = useRoute()
const { user, ensureHydrated } = useAuth()

await ensureHydrated()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const navItems = computed(() => [
  {
    title: t('nav.tournaments'),
    url: '/tournaments',
    icon: Trophy,
    isActive: isActive('/tournaments'),
  },
  {
    title: t('nav.sports'),
    url: '/sports',
    icon: GalleryVerticalEnd,
    isActive: isActive('/sports'),
  },
  {
    title: t('nav.admins'),
    url: '/admins',
    icon: Shield,
    isActive: isActive('/admins'),
  },
])
</script>

<template>
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            size="lg"
            class="data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <NuxtLink to="/tournaments">
              <Trophy class="size-5 shrink-0" />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ t('app.title') }}</span>
                <span class="truncate text-xs text-muted-foreground">
                  Admin
                </span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :label="t('nav.management')" :items="navItems" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser v-if="user" :email="user.email" />
    </SidebarFooter>
  </Sidebar>
</template>
