<template>
    <div class="border-b border-border pt-5 pb-4 px-10 flex items-center justify-between">
      <h1 class="flex items-center gap-2 min-h-9">
        <component :is="icon" class="w-5 h-5" />
        <RouterLink 
          v-if="isDefaultTitle" 
          to="/" 
          class="flex items-center gap-2"
        >
        <img src="/super.svg" alt="Superchange.ai logo" class="h-6" /><span> {{ title }}</span>
        </RouterLink>
        <template v-else>
          {{ title }}
        </template>
        <span v-if="isLoading" class="ml-2">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        </span>
      </h1>
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
          <Button variant="ghost" size="sm" @click="toggleTheme">
            <MoonStar class="h-5 w-5 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <SunMedium class="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button v-if="showHelpButton" variant="ghost" size="icon">
            <HelpCircle class="h-5 w-5" />
          </Button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { MoonStar, SunMedium, ListFilter, HelpCircle, X, Loader2} from 'lucide-vue-next'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Input } from '@/components/ui/input'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { useColorMode } from '@vueuse/core'
  import { ref, computed } from 'vue'
  import { RouterLink } from 'vue-router'
  
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
  
  // Theme toggle
  const mode = useColorMode()
  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }
  </script>