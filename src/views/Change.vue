<script setup>
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { changesService } from '@/api/services/changes.service';
import { authStore } from '../stores/auth'
import { feedbackService } from '@/api/services/feedback.service';
import { toast } from '@/components/ui/toast'
const getFeedbackKey = (changeId) => `feedback_${changeId}`
const feedbackGiven = reactive({});
import Header from '@/components/Header.vue'
import {
  HeartCrack,
  Shield,
  BatteryCharging,
  Package,
  FileText,
  Library,
  Bell,
  ThumbsUp,
  ThumbsDown
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}
const route = useRoute();
const change = computed(() => route.params.id);
const changelog = ref({});
const isLoading = ref(true);
const showFeedback = ref(true);
const hasGivenFeedback = (changeId) => {
    return feedbackGiven[getFeedbackKey(changeId)] !== undefined
}
const provideFeedback = async (itemId, value) => {
  console.log('Providing feedback:', itemId, value);
  try {
    // Store immediately in client storage
    const storageKey = getFeedbackKey(itemId)
    localStorage.setItem(storageKey, value.toString())
    feedbackGiven[storageKey] = value.toString()
    
    // also send to server
    await feedbackService.createChangeFeedback({
      changeId: itemId,
      feedback: value,
      userId: authStore.session?.user?.id
    })
    // Show toast
    toast({
            title: 'Feedback received.',
            description: 'Thank you so much for your contribution!',
            duration: 3000
        })
  } catch (err) {
    console.error('Failed to submit feedback:', err)
  }
}

const changeTypes = {
  security: {
    title: 'Security update',
    icon: Shield,
    slug: 'security'
  },
  performance: {
    title: 'Performance improvement',
    icon: BatteryCharging,
    slug: 'performance'
  },
  breaking: {
    title: 'Breaking change',
    icon: HeartCrack,
    slug: 'breaking'
  },
  new_feature: {
    title: 'New feature',
    icon: Package,
    slug: 'new_feature'
  },
  minor_fix: {
    title: 'Minor fix',
    icon: FileText,
    slug: 'minor_fix'
  },
  other: {
    title: 'Other change',
    icon: Library,
    slug: 'other'
  }
}

onMounted(async () => {
  try {
    isLoading.value = true;
    const data = await changesService.getById(Number(change.value));
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid change data received');
    }
    changelog.value = {
      id: change.value,
      diff: data.diff.summary || 'No summary available',
      explanation: data.explanation || 'No explanation available',
      classification: data.classification || 'Other',
      classificationTitle: !changeTypes[data.classification] ? undefined : changeTypes[data.classification].title,
      classificationIcon: !changeTypes[data.classification] ? undefined : changeTypes[data.classification].icon,
      source: data.source || 'No source available',
      timestamp: data.timestamp,
    };
    console.log(changelog.value);
  } catch (error) {
    console.error('Error fetching change:', error);
  } finally {
    isLoading.value = false;
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

</script>

<template>
  <Header 
      :title="isLoading ? '' : changelog.classificationTitle"
      :icon="isLoading ? '' : changelog.classificationIcon"
      :show-filter-button="false" 
      :show-help-button="true"
      :is-loading="isLoading"
    >
    </Header>
  <div class="py-2">
    <div class="px-4 md:px-11">
      
      <!-- Skeleton loading state -->
      <div v-if="isLoading" class="space-y-4 py-2 border-b">
          <div class="flex items-center">
            <div class="text-sm flex-1 text-left">
              <Skeleton class="h-4 w-96" />
            </div>
          </div>
      </div>
      
      <!-- Actual content -->
      <div v-else-if="changelog">
        <div class="py-5 text-left text-sm">
          <div class="pb-2 flex flex-col items-left md:flex-row md:items-center justify-center text-left gap-2">
            <div class="text-sm flex-1 text-left">
              <p>{{ changelog.diff }}</p>
            </div>
            <div class="text-xs text-muted-foreground whitespace-nowrap shrink-0 text-left">
              {{
              isMobile?
              new Date(changelog.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short'}) : 
              new Date(changelog.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
            }}
            </div>
          </div>
          <div>
            <Separator class="my-2" />
            <div class="flex text-left items-left flex-col md:flex-row md:items-center justify-between text-sm">
              <div>Source <Badge variant="outline"><a :href="changelog.source" target="_blank" class="hover:underline text-black dark:text-white">{{ changelog.source.url }}</a></Badge></div>

              <div 
                v-if="showFeedback"
                class="flex items-center gap-2"
                >
                Was this update useful?
                <button 
                  @click.stop="provideFeedback(changelog.id, 1)" 
                  class="p-1 rounded-sm" 
                  :class="{
                    'opacity-50': hasGivenFeedback(changelog.id) && feedbackGiven[getFeedbackKey(changelog.id)] === '-1',
                    'text-foreground': hasGivenFeedback(changelog.id) && feedbackGiven[getFeedbackKey(changelog.id)] === '1',
                    'hover:bg-accent': !hasGivenFeedback(changelog.id)                    
                  }"
                  :disabled="hasGivenFeedback(changelog.id)"
                  title="Helpful"
                >
                  <ThumbsUp class="h-4 w-4" />
                </button>
                <button 
                  @click.stop="provideFeedback(changelog.id, -1)" 
                  class="p-1 rounded-sm"
                  :class="{
                    'opacity-50': hasGivenFeedback(changelog.id) && feedbackGiven[getFeedbackKey(changelog.id)] === '1',
                    'text-foreground': hasGivenFeedback(changelog.id) && feedbackGiven[getFeedbackKey(changelog.id)] === '-1',
                    'hover:bg-accent': !hasGivenFeedback(changelog.id)
                  }"
                  :disabled="hasGivenFeedback(changelog.id)"
                  title="Not helpful"
                >
                  <ThumbsDown class="h-4 w-4" />
                </button>
              </div>
              
          </div>
          </div>
          
        </div>
      </div>
      <div v-else class="py-2 text-muted-foreground">
        This change can't be found.
      </div>

    </div>
  
  </div>
</template>