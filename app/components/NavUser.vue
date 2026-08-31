<script setup lang="ts">
import {
  ChevronsUpDown,
  LogOut,
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@onlyzoran/win-predict-ai-ui'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const props = defineProps<{
  email: string
}>()

const { t } = useI18n()
const { isMobile } = useSidebar()
const { logout: signOut } = useAuth()

const initials = computed(() => {
  const local = props.email.split('@')[0] ?? ''
  return local.slice(0, 2).toUpperCase() || '?'
})

async function logout() {
  await signOut()
  await navigateTo('/login')
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar shape="circle" class="size-8 shrink-0 bg-transparent">
              <AvatarFallback class="bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
                {{ initials }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ email }}</span>
              <span class="truncate text-xs text-muted-foreground">
                Admin
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar shape="circle" class="size-8 shrink-0 bg-transparent">
                <AvatarFallback class="bg-sidebar-accent text-xs font-medium text-sidebar-foreground">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ email }}</span>
                <span class="truncate text-xs text-muted-foreground">
                  Admin
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="logout">
            <LogOut />
            {{ t('common.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
