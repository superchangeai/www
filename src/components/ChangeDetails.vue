<script setup>
import { ref, computed, watch } from 'vue'
import { X, ChevronUp, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { changesService } from '@/api/services/changes.service'

const props = defineProps({
  changeId: {
    type: Number,
    required: true
  },
  allChanges: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'navigate'])

const change = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Fetch change details
const fetchChangeDetails = async (id) => {
  if (!id) return
  
  isLoading.value = true
  error.value = null
  
  try {
    change.value = await changesService.getById(id)
  } catch (err) {
    error.value = err.message || 'Failed to fetch change details'
    console.error('Error fetching change details:', err)
  } finally {
    isLoading.value = false
  }
}

// Watch for changeId changes
watch(() => props.changeId, (newId) => {
  if (newId) {
    fetchChangeDetails(newId)
  }
}, { immediate: true })

// Navigation functions
const currentIndex = computed(() => {
  if (!props.changeId || !props.allChanges.length) return -1
  return props.allChanges.findIndex(item => item.id === props.changeId)
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.allChanges.length - 1 && currentIndex.value !== -1)

const navigateToPrevious = () => {
  if (!hasPrevious.value) return
  emit('navigate', props.allChanges[currentIndex.value - 1].id)
}

const navigateToNext = () => {
  if (!hasNext.value) return
  emit('navigate', props.allChanges[currentIndex.value + 1].id)
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="change-details">
    <!-- Header with navigation and close button -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold" v-if="change">{{ (change.classification?.replace('_', ' ') || 'Unclassified').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') }}</h3>
      <div class="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          :disabled="!hasPrevious" 
          @click="navigateToPrevious"
          class="text-muted-foreground"
        >
          <ChevronUp class="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          :disabled="!hasNext" 
          @click="navigateToNext"
          class="text-muted-foreground"
        >
          <ChevronDown class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" @click="handleClose" class="text-muted-foreground">
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="py-4">
      <div class="animate-pulse space-y-3">
        <div class="h-4 bg-muted rounded w-3/4"></div>
        <div class="h-4 bg-muted rounded w-1/2"></div>
        <div class="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="py-4 text-destructive">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="change" class="space-y-4">
      <div>
        <p class="text-sm font-medium mb-1">Source</p>
        <p class="text-sm">
            <a :href="change.source.url" target="_blank" class="hover:underline text-black dark:text-white">{{ change.source?.url || 'Unknown' }}</a>
        </p>
      </div>

      <div>
        <p class="text-sm">{{ change.diff?.summary || change.explanation || 'No summary available' }}</p>
      </div>

      <!-- <div>
        <p class="text-sm font-medium mb-1">Classification</p>
        <p class="text-sm capitalize">{{ change.classification?.replace('_', ' ') || 'Unclassified' }}</p>
      </div> -->

      <div>
        <p class="text-sm font-medium mb-1">Date of update</p>
        <p class="text-sm">{{ new Date(change.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</p>
      </div>
    </div>

    <!-- No data state -->
    <div v-else class="py-4 text-muted-foreground">
      No change details available
    </div>
  </div>
</template>