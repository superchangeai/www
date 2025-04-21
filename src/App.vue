<template>
  <div class="flex flex-col md:flex-row bg-background text-foreground">
    
    <!-- Mobile Menubar -->
    <div v-if="isMobile && showSidebar" class="md:hidden sticky top-0 z-50 w-full bg-background border-b border-border">
      <div class="flex gap-2 items-center px-4 justify-between">
          <span class="flex items-center">
            <RouterLink to="/feed" class="flex items-center justify-center shrink-0">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6 mr-2" />
          </RouterLink>
          <Menu></Menu>
        </span>
        <div v-if="authStore.session?.user" class="flex items-center gap-2">
              <router-link to="/settings/profile" title="Go to your profile">
                <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground cursor-pointer hover:opacity-80">
                  {{ authStore.session?.user?.email?.[0].toUpperCase() || '?' }}
                </div>
              </router-link>
              <button @click="logout" title="Sign out 👋"><LogOut class="h-4 w-4 opacity-70" /></button>
        </div>
        <div v-else>
          <router-link to="/signup" custom v-slot="{ navigate, isActive }">
            <Button
                  variant="secondary"
                  class="w-full justify-start font-normal"
                  :class="{ 'bg-accent': isActive }"
                  @click="navigate"
              >
            Sign up
          </Button>
          </router-link>      
        </div>
      </div>
    </div>
    
    <!-- Desktop Sidebar -->
    <div v-if="showSidebar" class="hidden md:flex w-64 border-r border-border bg-muted/30 flex-col min-h-screen">
      <!-- Sticky header section -->
      <div class="sticky top-0 z-10 bg-muted/30">
        <!-- User profile -->
        <div class="p-6 flex items-center justify-between border-b border-border">
          <router-link to="/feed" class="flex items-center gap-2">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6" /> superchange.ai
          </router-link>
        </div>
    
        <!-- Accordion navigation menu -->
        <Menu></Menu>
      </div>
    
      <!-- Bottom settings section -->
      <div class="mt-auto p-3 space-y-1 border-t border-border sticky bottom-0 bg-background">
        <router-link v-if="authStore.session?.user" :to="'/settings'" custom v-slot="{ navigate, isActive }">
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
        <router-link v-else :to="'/signup'" custom v-slot="{ navigate, isActive }">
          <Button
                variant="secondary"
                class="w-full justify-start font-normal"
                :class="{ 'bg-accent': isActive }"
                @click="navigate"
            >
          <SquareUser class="mr-2 h-4 w-4" />
          Sign up
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
  LogOut,
  Settings,
  SquareUser,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Toaster from '@/components/ui/toast/Toaster.vue'
import Feedback from '@/components/Feedback.vue'
import { supabase } from './lib/supabase'
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { authStore } from './stores/auth'

const router = useRouter()
const showSidebar = ref(true)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

const authRoutes = ['/login', '/signup', '/', '/privacy']

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
      // Clean up localStorage
      localStorage.removeItem('superchange_selected_changelog')
      // Redirect to current page instead of always going to login
      router.push(currentRoute);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}
</script>