<script setup>
// functions
import { ref, computed, onMounted, watch, reactive, onBeforeUnmount } from 'vue'
import { supabase } from '../lib/supabase';
import { changesService } from '@/api/services/changes.service'
import { changelogsService } from '@/api/services/changelogs.service'
import { authStore } from '../stores/auth'
import { feedbackService } from '@/api/services/feedback.service';
import { useAuthDrawer } from '@/composables/useAuthDrawer'
import MarkdownIt from 'markdown-it'
import { useRouter } from 'vue-router';
// components
import Header from '@/components/Header.vue'
import { Skeleton } from '@/components/ui/skeleton'
import AuthDrawer from '@/components/AuthDrawer.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from '@/components/ui/tooltip'
import { Zap, HeartCrack, Shield, BatteryCharging, Package, FileWarning, FileText, Library, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'

// Props declaration from router
const props = defineProps({
  type: { // allows to filter the feed by type of changes
    type: String,
    default: 'all'
  }, // tells which changelog should be loaded in the feed
  changelogId: {
    type: String,
    default: null
  }
})

// Define router
const router = useRouter();

// Define local storage key for persisting one changelog selected by user
const SELECTED_CHANGELOG_KEY = 'superchange_selected_changelog'

// Get saved changelog from localStorage or use default
const getSavedChangelogId = () => {
  // 1. If props.changelogId is provided, it takes precedence, as this one comes from /changelogs or /changelog
  if (props.changelogId) return props.changelogId
  
  // 2. Check if we're on a public changelog route
  const isPublicChangelogRoute = window.location.pathname.startsWith('/changelog/');
  // Don't use localStorage for public changelog routes
  if (isPublicChangelogRoute) return 'default';
  
  // 3. Otherwise get from localStorage, return value or 'default' if this key isn't yet set
  const saved = localStorage.getItem(SELECTED_CHANGELOG_KEY)
  return saved || 'default'
}

// Define what is the changelog we will be using and showing
const selectedChangelogId = ref(getSavedChangelogId()) // 'default' if nothing, otherwise string value in user local data

// Define what is the type of changes to fetch and display
const feedType = computed(() => props.type || 'all') // default to 'all' or value in router

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

// API updates state
const updates = ref([])
const isLoading = ref(false)
const error = ref(null)
const limit = ref(3) // 3 months limit by default
const userChangelogs = ref([])

// Detail view state
const selectedChangeId = ref(null)
const expandedRowId = ref(null)

// Fetch changelogs from API
const fetchChangelogs = async () => {
  // Only fetch changelogs if user is authenticated
  if (!authStore.session) {
    userChangelogs.value = []
    // Clean up localStorage when logged out
    localStorage.removeItem(SELECTED_CHANGELOG_KEY)
    return
  }
  
  isLoading.value = true
  try {
    const logs = await changelogsService.getAll()
    userChangelogs.value = logs
    // Clean up invalid changelog ID from localStorage
    const savedChangelogId = localStorage.getItem(SELECTED_CHANGELOG_KEY)
    if (savedChangelogId && savedChangelogId !== 'default') {
      // Check if the saved changelog still exists
      console.log('Checking changelog id', savedChangelogId)
      const changelogExists = logs.some(log => log.changelog_id === savedChangelogId)
      if (!changelogExists) {
        console.warn('Invalid changelog ID in localStorage, cleaning up');
        localStorage.removeItem(SELECTED_CHANGELOG_KEY)
        selectedChangelogId.value = 'default'
      }
    }
  } catch (error) {
    console.error('Failed to fetch changelogs:', error)
    userChangelogs.value = [] // Set empty array on error
  } finally {
    isLoading.value = false
  }
}

// Fetch changes from API according to type and changelog requested
const fetchChanges = async () => {
  isLoading.value = true
  error.value = null
  try {
    const classification = feedType.value === 'all' || !feedTypeMap[feedType.value] 
      ? undefined 
      : feedTypeMap[feedType.value].slug;
    
    // Check if we're on a public changelog route
    const isPublicChangelogRoute = window.location.pathname.startsWith('/changelog/');
    
    // Prepare params for API request
    const params = { classification, limit: limit.value };
    
    // Verify public access for shared changelogs
    if (isPublicChangelogRoute && selectedChangelogId.value !== 'default') {
      try {
        const { is_public } = await changelogsService.isPublic(selectedChangelogId.value);
        if (!is_public) {
          console.log('This changelog is not available for public viewing');
          error.value = 'This changelog is not available for public viewing';
          isLoading.value = false;
          return;
        }
      } catch (err) {
        error.value = 'Unable to verify changelog access';
        isLoading.value = false;
        return;
      }
    }
    
    let changes = [];
    
    // Handle different API calls based on route and authentication
    if (selectedChangelogId.value && selectedChangelogId.value !== 'default') {
      // Showing a specific changelog
      params.changelogId = selectedChangelogId.value;
      changes = await changesService.getAll(params);
    } else {
      // Default feed - no specific changelog
      changes = await changesService.getAll(params);
    }
    
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

// ***
// DISPLAY MANAGEMENT
// ***

// Organize all found updates in months before display
const groupedUpdates = computed(() => {
  const groups = {};
  
  updates.value.forEach(item => {
    const date = new Date(item.timestamp);
    const monthYear = date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    
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

// Members can load more updates in the feed
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

// Handle item click
const handleItemClick = (item) => {
    expandedRowId.value = expandedRowId.value === item.id ? null : item.id
}

// Markdown parser for cleaner changes data
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true
})

// Strip markdown formatting
const stripMarkdown = (content) => {
  if (!content) return '';
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')      // italic
    .replace(/`(.*?)`/g, '$1')        // code
    .replace(/#+\s/g, '')            // headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // links
}

// Render markdown content
const renderMarkdown = (content) => {
  if (!content) return '';
  return md.render(content);
}

// Detecting layout
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// ***
// FEEDBACK MANAGEMENT
// ***

// Creates a local storage key for storing feedback
const getFeedbackKey = (changeId) => `feedback_${changeId}`

// Local state on feedbacks
const feedbackGiven = reactive({});

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

// ***
// HOOKS
// ***

// Component mount
onMounted(() => {
  // Load changelogs, either owned by user or default Superchange
  fetchChangelogs()
  // Load changes
  fetchChanges()
  // Load all existing feedback from storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('feedback_')) {
      feedbackGiven[key] = localStorage.getItem(key)
    }
  })
  checkMobile()
  window.addEventListener('resize', checkMobile)
})


onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// ***
// CHANGELOG MANAGEMENT
// ***

// Creation of changelog dropdown menu
const changelogSelectItems = computed(() => {
  // Check if we're on a public changelog route
  const isPublicChangelogRoute = window.location.pathname.startsWith('/changelog/');
  
  // For public routes, fetch the public changelog info
  if (isPublicChangelogRoute && props.changelogId) {
    // Return minimal items while loading
    if (isLoading.value) {
      return {
        items: [{ value: 'default', label: 'Superchange' }],
        buttonText: 'Loading...'
      };
    }
    
    // Return public changelog info
    return {
      items: [
        { value: 'default', label: 'Superchange' },
        { value: props.changelogId, label: `${props.changelogId} (shared)` }
      ],
      buttonText: 'Create a changelog'
    };
  }
  
  // For authenticated users, show their changelogs
  if (!userChangelogs.value || userChangelogs.value.length === 0) {
    return {
      items: [{ value: 'default', label: 'Superchange' }],
      buttonText: 'Customize this log!'
    };
  }
  
  return {
    items: [
      ...userChangelogs.value.map(log => ({
        value: log.changelog_id,
        label: log.name
      })),
      { value: 'default', label: 'Superchange' }
    ],
    buttonText: 'Add a changelog'
  };
});

// refresh data when props type change, so that we filter the updates
watch(feedType, () => {
  fetchChanges()
})

// Watch for route changes to ensure we're showing the right data
watch(
  () => [props.type, props.changelogId],
  () => {
    // Update local state to match route params
    if (props.changelogId && props.changelogId !== selectedChangelogId.value) {
      selectedChangelogId.value = props.changelogId
    }
    fetchChanges()
  }
)
// Refresh data when changelog is switching
watch(selectedChangelogId, () => {
  // Check if we're on a public changelog route
  const isPublicChangelogRoute = window.location.pathname.startsWith('/changelog/');
  
  // Only save to localStorage if user is authenticated and not on public route
  if (authStore.session && !isPublicChangelogRoute) {
    localStorage.setItem(SELECTED_CHANGELOG_KEY, selectedChangelogId.value)
  }
  
  // If the user selects a changelog, redirect to the appropriate URL
  if (selectedChangelogId.value !== 'default') {
    // If we're already on a feed type page, maintain the type
    if (feedType.value) {
      // Navigate to /changelogs/:changelogId/:type for authenticated users
      if (authStore.session) {
        router.push(`/changelogs/${selectedChangelogId.value}/${feedType.value}`);
      } else {
        // For non-authenticated users, use the public route
        router.push(`/changelog/${selectedChangelogId.value}`);
      }
    } else {
      // Navigate to /changelogs/:changelogId for authenticated users
      if (authStore.session) {
        router.push(`/changelogs/${selectedChangelogId.value}`);
      } else {
        // For non-authenticated users, use the public route
        router.push(`/changelog/${selectedChangelogId.value}`);
      }
    }
  } else {
    console.log("Switched to Superchange");
    // If user selects 'default', go back to the main feed with current type
    router.push(`/feed/${feedType.value || 'all'}`); // may or may not be executed in case we are already on feed/all
    fetchChanges(); // in case
  }
  // Fetch changes will be triggered by the route change
});

</script>
<template>

    <Header 
      :title="'none'"
      :icon="false"
      :is-loading="currentFeedConfig.isLoading"
      :show-filter-button="false" 
      :show-help-button="true"
    >
      <template #changelog>
        <h3 class="text-sm">Changelog:</h3>
        <Select class="shadow-none" v-model="selectedChangelogId">
          <SelectTrigger class="shadow-none">
            <Skeleton v-if="isLoading" class="h-4 w-20" />
            <div v-else>
              <SelectValue placeholder="default" />
            </div>
          </SelectTrigger>
          <SelectContent class="border-0">
            <SelectGroup>
              <!-- TODO: CHECK THIS TEMPLATE, KEY AND VALUE BOTH USE ITEM.VALUE IT'S ODD -->
              <template v-for="item in changelogSelectItems.items" :key="item.value">
                <SelectItem :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </template>
            </SelectGroup>
            <SelectGroup>
              <Router-link to="/changelogs/new">
                <Button class="w-full">
                  {{ changelogSelectItems.buttonText }}
                </Button>
              </Router-link>
            </SelectGroup>
          </SelectContent>
        </Select>
      </template>
    </Header> 
    <!-- Skeleton loading state -->
    <div v-if="isLoading" class="py-2">
      <div class="py-2 px-4 md:px-11">
        <Skeleton class="h-8 basis-1/6" />
      </div>
      <div v-for="i in 5" :key="i" class="py-5 px-4 md:px-11">
        <div class="flex items-center space-x-4">
          <Skeleton class="h-6 basis-1/6" />
          <Skeleton class="h-6 basis-4/6" />
          <Skeleton class="h-6 basis-1/6 ml-auto" />
        </div>
      </div>
    </div>
    <!-- Empty state when errors occur -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 px-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Oops! {{ error }}</h3>
        </div>
      </div>
    <!-- Empty state when no updates are available -->
    <div v-else-if="Object.keys(groupedUpdates).length === 0" class="flex flex-col items-center justify-center py-12 px-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">No updates available</h3>
          <p class="text-muted-foreground mb-4 text-sm">There are currently no changes listed in this category. We just started collecting early 2025 you know. <br> Check back later or explore other categories.</p>
          <router-link to="/feed/all">
            <Button variant="outline">View all changes</Button>
          </router-link>
        </div>
      </div>
    <!-- Group updates by month -->
    <div v-else v-for="(monthUpdates, month) in groupedUpdates" :key="month" class="py-2">
      <div class="py-2 flex items-center px-4 md:px-11">
        <h2 class="font-semibold cursor-pointer">
          <a :href="`#${month.toLowerCase().replace(' ', '-')}`" class="text-black dark:text-white">{{ month }}</a>
        </h2>
      </div>

      <!-- API Update Items -->
      <div v-for="(item, index) in monthUpdates" :key="index" 
           class="hover:bg-accent/50 cursor-pointer py-5 transition-all duration-300 ease-in-out"
           @click="handleItemClick(item)">
        <div class="pb-2 flex items-center px-4 md:px-11">
          <div class="text-sm font-medium shrink-0 pr-6 text-left flex items-center gap-2 shrink-0 flex-none w-28 min-w-28">
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
                {{
                  isMobile?
                  'AI summary':
                  'Summary by'
                }}
                <Badge 
                  variant="outline" 
                  class="hidden md:inline cursor-pointer ml-1 px-1"
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
            {{
              isMobile?
              new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short'}) : 
              new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long'}) 
            }}
            <ChevronDown v-if="expandedRowId !== item.id" class="h-4 w-4 transition-transform" />
            <ChevronUp v-if="expandedRowId === item.id" class="h-4 w-4 transition-transform" />
          </div>
        </div>
        
        <!-- Expandable content -->
        <div v-if="expandedRowId === item.id" 
             class="space-y-3 animate-in slide-in-from-top-2 duration-300">
             <div class="pb-2 flex items-center px-4 md:px-11">
                <div class="hidden md:block text-sm font-medium shrink-0 flex-none w-28 min-w-28 text-left"></div>
                <div class="text-sm flex-1 text-left basis-5/6 pt-3">
                  <div v-html="renderMarkdown(item.diff?.summary || item.explanation || 'No summary available')"></div>
                  <Separator class="my-2" />
                  <div>
                    Source <Badge variant="outline"><a :href="item.source.url" target="_blank" class="hover:underline text-black dark:text-white">{{ item.source.url }}</a></Badge>
                  </div>
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