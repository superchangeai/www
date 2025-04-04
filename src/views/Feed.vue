<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase';
import Header from '@/components/Header.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthDrawer } from '@/composables/useAuthDrawer'
import AuthDrawer from '@/components/AuthDrawer.vue'
import { changesService } from '@/api/services/changes.service'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import MarkdownIt from 'markdown-it'
import {
  ArrowDown,
  Zap,
  HeartCrack,
  Shield,
  BatteryCharging,
  Package,
  FileWarning,
  FileText,
  Library,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown
} from 'lucide-vue-next'
import { authStore } from '../stores/auth'
import { feedbackService } from '@/api/services/feedback.service';
import { toast } from '@/components/ui/toast'

// check feedback storage
const getFeedbackKey = (changeId) => `feedback_${changeId}`
const feedbackGiven = reactive({});


// derive title and icon based on params
const route = useRoute()

// Prop declaration from router
const props = defineProps({
  type: {
    type: String,
    default: 'all'
  }
})

const feedType = computed(() => props.type || 'all')
const feedTypeMap = {
  all: {
    title: 'All updates',
    icon: Zap,
    slug: 'all'
  },
  security: {
    title: 'Security updates',
    icon: Shield,
    slug: 'security'
  },
  performance: {
    title: 'Performance improvements',
    icon: BatteryCharging,
    slug: 'performance'
  },
  breaking: {
    title: 'Breaking changes',
    icon: HeartCrack,
    slug: 'breaking'
  },
  feature: {
    title: 'New features',
    icon: Package,
    slug: 'new_feature'
  },
  minor: {
    title: 'Minor fixes',
    icon: FileText,
    slug: 'minor_fix'
  },
  other: {
    title: 'Other changes',
    icon: Library,
    slug: 'other'
  }
}
// config the header title and icon
const currentFeedConfig = computed(() => ({
  ...feedTypeMap[feedType.value] || feedTypeMap.all,
  isLoading: isLoading.value
}))

// create a drawer
const { isOpen, options, open } = useAuthDrawer()
const handleLoadMore = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    open({
      title: 'Sign in to view more',
      description: 'Members can search history and create alerts',
      onSuccess: () => {
        limit.value += 3; // Increase limit by 3 months
        fetchChanges();
      }
    });
  } else {
    limit.value += 3; // Increase limit by 3 months
    fetchChanges();
  }
}

// API updates state
const updates = ref([])
const isLoading = ref(false)
const error = ref(null)
const limit = ref(3) // 3 months limit by default

// Detail view state
const selectedChangeId = ref(null)
const expandedRowId = ref(null)

// Fetch changes from API
const fetchChanges = async () => {
  isLoading.value = true
  error.value = null
  try {
    const classification = feedType.value === 'all' || !feedTypeMap[feedType.value] 
      ? undefined 
      : feedTypeMap[feedType.value].slug;
    const changes = await changesService.getAll({ classification, limit: limit.value })
    // Add showFeedback property to each item
    updates.value = changes.map(item => ({
      ...item,
      showFeedback: false
    }));
  } catch (err) {
    error.value = err.message || 'Failed to fetch updates'
  } finally {
    isLoading.value = false
  }
}

const groupedUpdates = computed(() => {
  const groups = {};
  
  updates.value.forEach(item => {
    const date = new Date(item.timestamp);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(item);
  });

  // Sort months in descending order
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
  );
});

// Initialize markdown parser
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true
})

// Function to strip markdown formatting
const stripMarkdown = (content) => {
  if (!content) return '';
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')      // italic
    .replace(/`(.*?)`/g, '$1')        // code
    .replace(/#+\s/g, '')            // headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // links
}

// Function to render markdown content
const renderMarkdown = (content) => {
  if (!content) return '';
  return md.render(content);
}

// Component mount
onMounted(() => {
  // Load changes from DB
  fetchChanges()
  // Load existing feedback from storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('feedback_')) {
      feedbackGiven[key] = localStorage.getItem(key)
    }
  })
})

// refresh data when route changes
watch(feedType, () => {
  fetchChanges()
})

// Handle item click
const handleItemClick = (item) => {
    expandedRowId.value = expandedRowId.value === item.id ? null : item.id
}

// computed property to check feedback status
const hasGivenFeedback = (changeId) => {
    return feedbackGiven[getFeedbackKey(changeId)] !== undefined
}

// Handle feedback on summaries
const provideFeedback = async (itemId, value) => {
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
</script>
<template>

    <Header 
      :title="currentFeedConfig.title"
      :icon="currentFeedConfig.icon"
      :is-loading="currentFeedConfig.isLoading"
      :show-filter-button="true" 
      :show-help-button="true"
    >
    </Header> 
    <!-- Skeleton loading state -->
    <div v-if="isLoading" class="py-2">
      <div class="px-11 py-2">
        <Skeleton class="h-8 basis-1/6" />
      </div>
      <div v-for="i in 5" :key="i" class="px-11 py-5">
        <div class="flex items-center space-x-4">
          <Skeleton class="h-6 basis-1/6" />
          <Skeleton class="h-6 basis-4/6" />
          <Skeleton class="h-6 basis-1/6 ml-auto" />
        </div>
      </div>
    </div>
    <!-- Group updates by month -->
    <div v-else v-for="(monthUpdates, month) in groupedUpdates" :key="month" class="py-2">
      <div class="px-11 py-2 flex items-center">
        <h2 class="font-semibold cursor-pointer">
          <a :href="`#${month.toLowerCase().replace(' ', '-')}`" class="text-black dark:text-white">{{ month }}</a>
        </h2>
      </div>

      <!-- API Update Items -->
      <div v-for="(item, index) in monthUpdates" :key="index" 
           class="hover:bg-accent/50 cursor-pointer py-5 transition-all duration-300 ease-in-out"
           @click="handleItemClick(item)">
        <div class="px-11 pb-2 flex items-center">
          <div class="text-sm font-medium shrink-0 pr-6 basis-1/6 text-left flex items-center gap-2">
            <Badge variant="outline" class="px-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <component 
                      :is="Object.values(feedTypeMap).find(type => type.slug === item.classification)?.icon || feedTypeMap.other.icon"
                      class="h-4 w-4"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {{ Object.values(feedTypeMap).find(type => type.slug === item.classification)?.title || feedTypeMap.other.title }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Badge>
            {{item.source.provider.name}}
          </div>
          <div class="text-sm text-muted-foreground truncate flex-1 text-left basis-4/6" v-if="expandedRowId !== item.id">
            {{ stripMarkdown(item.diff?.summary || item.explanation) }}
          </div>
          <div v-else class="text-sm text-muted-foreground truncate flex-1 text-left basis-4/6">
            <span class="flex items-center gap-2">
              <div class="relative inline-block">
                Summary by
                <Badge 
                  variant="outline" 
                  class="cursor-pointer"
                  @mouseenter="item.showFeedback = true"
                  
                >
                  Llama-3.3-70b
                </Badge>
                <div 
                v-if="item.showFeedback"
                class="absolute z-10 flex -right-16 -top-1 p-1"
                @mouseenter="item.showFeedback = true"
                >
                <button 
                  @click.stop="provideFeedback(item.id, 1)" 
                  class="p-1 rounded-sm" 
                  :class="{
                    'opacity-50': hasGivenFeedback(item.id) && feedbackGiven[getFeedbackKey(item.id)] === '-1',
                    'text-foreground': hasGivenFeedback(item.id) && feedbackGiven[getFeedbackKey(item.id)] === '1',
                    'hover:bg-accent': !hasGivenFeedback(item.id)                    
                  }"
                  :disabled="hasGivenFeedback(item.id)"
                  title="Helpful"
                >
                  <ThumbsUp class="h-4 w-4" />
                </button>
                <button 
                  @click.stop="provideFeedback(item.id, -1)" 
                  class="p-1 rounded-sm"
                  :class="{
                    'opacity-50': hasGivenFeedback(item.id) && feedbackGiven[getFeedbackKey(item.id)] === '1',
                    'text-foreground': hasGivenFeedback(item.id) && feedbackGiven[getFeedbackKey(item.id)] === '-1',
                    'hover:bg-accent': !hasGivenFeedback(item.id)
                  }"
                  :disabled="hasGivenFeedback(item.id)"
                  title="Not helpful"
                >
                  <ThumbsDown class="h-4 w-4" />
                </button>
              </div>
              </div>
            </span>
          </div>
          <div class="flex justify-end items-center gap-2 text-xs text-muted-foreground whitespace-nowrap shrink-0 basis-1/6 text-right">
            {{ new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
            <ChevronDown v-if="expandedRowId !== item.id" class="h-4 w-4 transition-transform" />
            <ChevronUp v-if="expandedRowId === item.id" class="h-4 w-4 transition-transform" />
          </div>
        </div>
        
        <!-- Expandable content -->
        <div v-if="expandedRowId === item.id" 
             class="space-y-3 animate-in slide-in-from-top-2 duration-300">
             <div class="px-11 pb-2 flex items-center">
                <div class="text-sm font-medium shrink-0 pr-6 basis-1/6 text-left"> </div>
                <div class="text-sm text-muted-foreground flex-1 text-left basis-4/6">
                  <div v-html="renderMarkdown(item.diff?.summary || item.explanation || 'No summary available')"></div>
                  <Separator class="my-2" />
                  <div>
                    Source <Badge variant="outline"><a :href="item.source.url" target="_blank" class="hover:underline text-black dark:text-white">{{ item.source.url }}</a></Badge>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap shrink-0 basis-1/6 text-right">
                </div>
              </div>
        </div>
      </div>
    </div>

    <!-- Load more -->
    <!-- ADD THIS ONCE WE HAVE 3 MONTHS OF DATA OR MORE v-if="Object.keys(groupedUpdates).length > 3" --> 
    <!--
    <div class="p-4 flex justify-center align-center">
      <Button variant="ghost" class="text-muted-foreground flex justify-center items-center text-sm" @click="handleLoadMore">
        <ArrowDown class="h-4 w-4 mr-2" />
        <span>Load more</span>
      </Button>
    </div>
    -->
    <AuthDrawer
      v-model:isOpen="isOpen"
      v-bind="options"
      @success="options.onSuccess?.()"
    />
</template>