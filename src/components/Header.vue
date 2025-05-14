<template>
    <div class="border-b border-border pt-5 pb-4 flex items-center justify-between px-4 md:px-10">
      <div class="flex items-center justify-between gap-2 min-h-9 min-w-9 shrink-none flex-none">
        <slot name="changelog">
        </slot>
        <component v-if="icon" :is="icon" class="w-5 h-5 shrink-0" />
        <h1 class="flex items-center gap-2">
        <RouterLink 
          v-if="isDefaultTitle" 
          to="/feed" 
          class="flex items-center gap-2"
        >
        <img src="/super.svg" alt="Superchange.ai logo" class="h-6" /><span> {{ title }}</span>
        </RouterLink>
        <template v-else-if="!isDefaultTitle && title!='none'" class="truncate">
          {{ title }}
        </template>
        <span v-if="isLoading" class="ml-2">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        </span>
        </h1>
      </div>
      <div class="flex items-center gap-2">
          <slot name="actions">
          </slot>
          <Popover v-if="showFilterButton">
            <PopoverTrigger>
              <Button 
                variant="ghost" 
                size="icon"
                :class="{'bg-primary text-primary-foreground': activeFilters > 0}"
                class="relative"
              >
                <ListFilter class="h-5 w-5" />
                <Badge 
                  v-if="activeFilters > 0" 
                  class="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                >
                  {{ activeFilters }}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80 p-4">
              <div class="space-y-4">
                <h4 class="font-medium text-sm">{{ activeFilters === 0 ? 'No filters applied' : 'Active filters' }}</h4>
                <p v-if="activeFilters === 0" class="text-sm text-muted-foreground">Enter values to filter the feed:</p>
                
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Badge variant="outline" class="text-xs w-1/4 flex-none">Provider</Badge>
                    <span class="text-sm">=</span>
                    <Input 
                      v-model="providerFilter" 
                      class="h-8 w-3/4" 
                      placeholder="Enter provider..." 
                      @keyup.enter="applyFilters"
                    />
                    <Button 
                      v-if="providerFilter.trim()"
                      variant="ghost" 
                      size="icon" 
                      class="h-8 w-8"
                      @click="clearProviderFilter"
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <Badge variant="outline" class="text-xs w-1/4 flex-none">Date</Badge>
                    <span class="text-sm">=</span>
                    <Input 
                      v-model="dateFilter" 
                      class="h-8 w-3/4" 
                      placeholder="mm/dd/yyyy" 
                      @keyup.enter="applyFilters"
                    />
                    <Button 
                      v-if="dateFilter.trim()"
                      variant="ghost" 
                      size="icon" 
                      class="h-8 w-8"
                      @click="clearDateFilter"
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  class="w-full" 
                  :disabled="!canApplyFilter" 
                  @click="applyFilters"
                >
                  Apply filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button v-if="showHelpButton" variant="ghost" size="icon">
            <Sheet>
              <SheetTrigger><HelpCircle class="h-5 w-5 text-muted-foreground" /></SheetTrigger>
              <SheetContent>
              <SheetHeader>
                <SheetTitle>Work in progress</SheetTitle>
                <SheetDescription>
                  Soon useful pointers and user guide will be published here.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
            </Sheet>
          </Button>
          <div v-if="authStore.session?.user && !isMobile" class="flex items-center gap-2">
            <router-link to="/settings/profile" title="Go to your profile">
              <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground cursor-pointer hover:opacity-80">
                {{ authStore.session?.user?.email?.[0].toUpperCase() || '?' }}
              </div>
            </router-link>
            <button @click="logout" title="Sign out 👋"><LogOut class="h-4 w-4 opacity-70" /></button>
          </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { ListFilter, HelpCircle, X, Loader2, LogOut} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useColorMode } from '@vueuse/core'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { authStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

const router = useRouter()


const props = defineProps({
  title: {
    type: String,
    default: import.meta.env.VITE_APP_TITLE
  },
  icon: {
    type: Function,
    default: undefined
  },
  isLoading: Boolean,
  showFilterButton: Boolean,
  showHelpButton: Boolean
})

const isDefaultTitle = computed(() => props.title === import.meta.env.VITE_APP_TITLE)


// Define emits
const emit = defineEmits(['filter-applied', 'filter-cleared'])

// Filter state
const providerFilter = ref('')
const dateFilter = ref('')
const activeFilters = ref(0)

// Computed properties
const canApplyFilter = computed(() => {
  return providerFilter.value.trim() !== '' || dateFilter.value.trim() !== ''
})

// Methods
const clearProviderFilter = () => {
  providerFilter.value = ''
  if (activeFilters.value > 0) {
    activeFilters.value--
  }
}

const clearDateFilter = () => {
  dateFilter.value = ''
  if (activeFilters.value > 0) {
    activeFilters.value--
  }
}

const applyFilters = () => {
  // Count active filters
  activeFilters.value = 0
  if (providerFilter.value.trim() !== '') {
    activeFilters.value++
  }
  if (dateFilter.value.trim() !== '') {
    activeFilters.value++
  }
  
  // Emit event to the parent component to apply the filters
  emit('filter-applied', { 
    provider: providerFilter.value.trim(), 
    date: dateFilter.value.trim() 
  })
}

// Detecting layout
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

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

onMounted(() => {
  // Theme toggle
  useColorMode()
  checkMobile()
  window.addEventListener('resize', checkMobile)
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

</script>