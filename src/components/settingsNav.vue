<template>
  <div class="w-64 border-r p-4 h-full min-h-full">
    <nav class="space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.route"
        custom
        v-slot="{ navigate }"
      >
        <Button
          :variant="$route.path.startsWith(item.route) ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          @click="navigate"
        >
          {{ item.label }}
        </Button>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  route: string
}

const navItems: NavItem[] = [
  { label: 'Profile', route: '/settings/profile' },
  { label: 'Channels', route: '/settings/channels' },
]
</script>