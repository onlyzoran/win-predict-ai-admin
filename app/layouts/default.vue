<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

const { isAuthenticated, ensureHydrated } = useAuth()
const { isNexoraActive } = useColorPalette()

await ensureHydrated()
</script>

<template>
  <div
    v-if="!isAuthenticated"
    :class="['min-h-screen bg-background', { 'nexora-canvas': isNexoraActive }]"
  >
    <slot />
  </div>
  <SidebarProvider
    v-else
    :class="['app-shell-sidebar', { 'nexora-canvas': isNexoraActive }]"
  >
    <AppSidebar />
    <SidebarInset class="app-shell-main bg-background">
      <SiteHeader />
      <div class="flex flex-1 flex-col">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
