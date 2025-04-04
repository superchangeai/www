<template>
  <div class="flex bg-background text-foreground">
    
    <!-- Sidebar -->
    <div v-if="showSidebar" class="w-64 border-r border-border bg-muted/30 flex flex-col min-h-screen">
      <!-- Sticky header section -->
      <div class="sticky top-0 z-10 bg-muted/30">
        <!-- User profile -->
        <div class="p-6 flex items-center justify-between border-b border-border">
          <router-link to="/" class="flex items-center gap-2">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6" /> superchange.ai
          </router-link>
          <div v-if="authStore.session?.user" class="flex items-center gap-2">
            <router-link to="/settings/profile" title="Go to your profile">
              <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground cursor-pointer hover:opacity-80">
                {{ authStore.session?.user?.email?.[0].toUpperCase() || '?' }}
              </div>
            </router-link>
            <button @click="logout" title="Sign out 👋"><LogOut class="h-4 w-4 opacity-70" /></button>
          </div>
        </div>
    
        <!-- Search box
        <div class="p-3 border-b border-border">
          <div class="relative">
            <Search class="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              class="pl-12 border-none h-9"
            />
          </div>
        </div> -->
    
        <!-- Accordion navigation menu -->
        <Menu></Menu>
      </div>
    
      <!-- Scrollable content area -->
      <div class="flex-1 overflow-y-auto">
        <!-- Content that can scroll (empty in current implementation) -->
      </div>
    
      <!-- Bottom settings section -->
      <div class="mt-auto p-3 space-y-1 border-t border-border sticky bottom-0 bg-background">
        <router-link :to="'/settings'" custom v-slot="{ navigate, isActive }">
          <Button
                variant="ghost"
                class="w-full justify-start font-normal"
                :class="{ 'bg-accent': isActive }"
                @click="navigate"
            >
          <Settings class="mr-2 h-4 w-4" />
          Settings
        </Button>
      </router-link>
        <Feedback />
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Content -->
      <div class="flex-1 overflow-auto">
        
        <router-view></router-view>
        
      </div>
    </div>
  </div>
  <Toaster />
</template>

<script setup lang="ts">

import {
  // Search,
  LogOut,
  Settings,
} from 'lucide-vue-next'
// import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Toaster from '@/components/ui/toast/Toaster.vue'
import Feedback from '@/components/Feedback.vue'
import { supabase } from './lib/supabase'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { authStore } from './stores/auth'
const router = useRouter()
const showSidebar = ref(true)

const authRoutes = ['/login', '/signup', '/']

// Watch for route changes
router.afterEach((to) => {
  showSidebar.value = !authRoutes.includes(to.path)
})

// Initialize based on current route
showSidebar.value = !authRoutes.includes(router.currentRoute.value.path)
import Menu from '@/components/Menu.vue'

// Define logout method
const logout = async () => {
  try {
    // Store current route before logout
    const currentRoute = router.currentRoute.value.path;
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout failed:', error.message)
      alert('Failed to log out. Please try again.')
    } else {
      // Redirect to current page instead of always going to login
      router.push(currentRoute);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}
</script>