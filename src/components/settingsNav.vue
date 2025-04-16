<template>
  <div class="md:w-64 md:border-r px-4 md:py-4">
    <nav class="flex flex-row items-center items-center justify-center md:flex-col md:space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.route"
        custom
        v-slot="{ navigate }"
        class="flex"
      >
        <Button
          :variant="$route.path.startsWith(item.route) ? 'secondary' : 'ghost'"
          class="w-full justify-start items-center"
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
  { label: 'Changelogs', route: '/settings/changelogs' },
  { label: 'Channels', route: '/settings/channels' },
]
</script>