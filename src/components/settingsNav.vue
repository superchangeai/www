<template>
  <div class="w-64 border-r p-4 h-full min-h-full">
    <nav class="space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.route"
        custom
        v-slot="{ navigate, isActive }"
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

<script>
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'  
export default {
  name: 'LeftNav',
  components: {
    Button,
  },
  setup() {
    const router = useRouter()
    const navItems = [
      { label: 'Profile', route: '/settings/profile' },
      { label: 'Channels', route: '/settings/channels' },
    ]

    return {
      navItems
    }
  },
}
</script>