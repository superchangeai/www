<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { providersService } from '@/api/services/providers.service';
import { changesService } from '@/api/services/changes.service';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import Header from '@/components/Header.vue'
import {
  Bell,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button';
import { useAuthDrawer } from '@/composables/useAuthDrawer'
import AuthDrawer from '@/components/AuthDrawer.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { authStore } from '@/stores/auth'
import { useHead } from '@unhead/vue';
import MarkdownIt from 'markdown-it'


const route = useRoute();
const provider = computed(() => route.params.id);
const currentProvider = ref({ title: '', sources: [] });
const isLoading = ref(true);
const headData = ref({});
const providerChanges = ref([]);
const isLoadingChanges = ref(false);
// Initialize head in setup context
useHead(headData);
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

onMounted(async () => {
  try {
    isLoading.value = true;
    const data = await providersService.getById(Number(provider.value));
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid provider data received');
    }
    currentProvider.value = {
      id: data.id?.toString() || '',
      title: data.name || 'Unknown Provider',
      value: (data.name || '').toLowerCase().replace(/\s+/g, ''),
      sources: Array.isArray(data.sources) ? data.sources.map(s => ({
        source: s?.url || '',
        last_snapshot_at: s?.last_snapshot_at || null
      })) : [],
      changes: (data.source_count || 0).toString()
    };
    // Update head metadata when post is loaded
    headData.value = {
        title: `Superchange.ai | Never miss critical updates from ${currentProvider.value.title}` || 'Superchange.ai | Provider',
        meta: [
          { name: 'description', content: `Dependance on ${currentProvider.value.title}? No stress. Updates from ${currentProvider.value.title} are tracked and classified by Superchange.ai` || `Depending on ${currentProvider.value.title}? Features, breaking changes and hot fixes are all centralized on Superchange.ai.` },
          { property: 'og:title', content: `Superchange.ai | Never miss an update from ${currentProvider.value.title}` || 'Superchange.ai | Your changelog of changelogs' },
          { property: 'og:description', content: `Updates from ${currentProvider.value.title} are tracked and classified by Superchange.ai` || `New features, breaking changes and hot fixes are all centralized on Superchange.ai.` }
          
        ]
      };
  } catch (error) {
    console.error('Error fetching provider:', error);
    currentProvider.value = { title: 'Error loading provider', sources: [] };
  } finally {
    isLoading.value = false;
    // After provider is loaded, fetch its changes
    fetchProviderChanges();
  }
});

// Fetch changes for this provider
const fetchProviderChanges = async () => {
  try {
    isLoadingChanges.value = true;
    const data = await changesService.getAll({
      provider_id: Number(provider.value),
      limit: 10 // Get the last 10 changes
    });
    providerChanges.value = data;
  } catch (error) {
    console.error('Error fetching provider changes:', error);
  } finally {
    isLoadingChanges.value = false;
  }
};

const { isOpen, options, open } = useAuthDrawer()
const handleNotify = () => {
  const redirectPath = '/alerts/new' + '?providers=' + currentProvider.value.title.toLowerCase().replace(/\s+/g, '');
  console.log(redirectPath);
  
  // Check if user is authenticated
  if (authStore.session) {
    // User is authenticated, redirect directly
    window.location.href = redirectPath;
  } else {
    // User is not authenticated, open auth drawer
    open({
      title: `Stay on top of changes from ${currentProvider.value.title}`,
      description: 'Superchange members can search history and create alerts',
      redirectPath: redirectPath
    })
  }
}

</script>

<template>
  <Header 
      :title="isLoading ? '' : currentProvider.title"
      :icon="false"
      :show-filter-button="false" 
      :show-help-button="true"
      :is-loading="isLoading"
    >
      <template #actions>
          <Button variant="secondary" @click="handleNotify" v-if="!isLoading">
            <Bell class="mr-2 h-4 w-4" /> Create an alert
          </Button>
      </template>
    </Header>
  <div class="py-2">
    <div class="px-4 md:px-11">
      <div class="py-2 flex items-center">
        <h2 class="font-semibold" v-if="!isLoading">{{ currentProvider.title }} sources collected:</h2>
        <Skeleton class="h-6 w-48" v-else />
      </div>
      
      <!-- Skeleton loading state -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="py-2 border-b">
          <div class="flex items-center">
            <div class="text-sm flex-1 text-left">
              <Skeleton class="h-4 w-96" />
            </div>
            <div class="text-xs whitespace-nowrap shrink-0 ml-4">
              <Skeleton class="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actual content -->
      <div v-else-if="currentProvider.sources && currentProvider.sources.length > 0">
        <div v-for="(sourceItem, index) in currentProvider.sources" :key="index" class="py-2 border-b">
          <div class="flex flex-col items-left md:flex-row md:items-center justify-center text-left gap-2">
            <div class="text-sm text-muted-foreground flex-1 text-left truncate">
              <a :href="sourceItem.source" target="_blank" class="hover:underline text-black dark:text-white">{{ sourceItem.source }}</a>
            </div>
            <div class="text-xs text-muted-foreground whitespace-nowrap shrink-0 text-left">
              Latest scan: {{ new Date(sourceItem.last_snapshot_at).toLocaleString() }}
            </div>
          </div>
        </div>

        <Card class="provider-card relative overflow-hidden my-10" v-if="!isLoading">
        <CardHeader>
          <h3 class="text-lg font-semibold">Never miss critical updates from {{ currentProvider.title }}</h3>
          <p class="text-muted-foreground text-sm">We will let you know when something comes up</p>
        </CardHeader>
        <CardContent class="relative z-10">
          <Button class="max-w-full truncate" variant="secondary" @click="handleNotify"><Bell class="mr-2 h-4 w-4" /> Create an alert</Button>
        </CardContent>
        <div class="provider-card-bg absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" fill="none" class="w-full h-full">
              <defs>
                <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#6b7280" />
                  <stop offset="100%" stop-color="#d1d5db" stop-opacity="0" />
                </linearGradient>
              </defs>
              <g stroke="url(#circleGradient)" stroke-width="1" fill="none" stroke-opacity="1">
                  <circle cx="50" cy="50" r="50"/>
                  <circle cx="50" cy="50" r="100"/>
                  <circle cx="50" cy="50" r="150"/>
                  <circle cx="50" cy="50" r="200"/>
                  <circle cx="50" cy="50" r="250"/>
              </g>
          </svg>
        </div>
      </Card>

        <!-- Changes from this provider -->
        <div class="mt-8 text-left">
          <h2 class="font-semibold mb-4">Recent changes from {{ currentProvider.title }}:</h2>
          
          <!-- Changes loading state -->
          <div v-if="isLoadingChanges" class="space-y-4">
            <div v-for="i in 3" :key="i" class="py-4 border-b">
              <div class="flex flex-col gap-2">
                <Skeleton class="h-5 w-32" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-3/4" />
              </div>
            </div>
          </div>
          
          <!-- Changes content -->
          <div v-else-if="providerChanges.length > 0" class="space-y-4">
            <div v-for="change in providerChanges" :key="change.id" class="py-4 border-b">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <Badge :variant="change.classification === 'breaking' ? 'destructive' : 
                                  change.classification === 'security' ? 'warning' : 
                                  change.classification === 'new_feature' ? 'default' : 'outline'">
                    {{ change.classification.replace('_', ' ') }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">{{ new Date(change.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric'}) }}</span>
                </div>
                <div class="text-sm font-medium summary" v-html="renderMarkdown(change.diff?.summary || change.explanation || 'No summary available')"></div>
                <p class="text-xs text-muted-foreground">Source: <a :href="change.source?.url">{{ change.source?.url }}</a></p>
              </div>
            </div>
          </div>
          <div v-else class="py-4 text-sm text-muted-foreground">
            No recent changes detected for this provider.
          </div>
        </div>
      </div>

      <div v-else class="py-2 text-sm text-muted-foreground">
        No sources available for this provider yet.
      </div>

      <AuthDrawer
          v-model:isOpen="isOpen"
          v-bind="options"
          @success="options.onSuccess?.()"
        />
    </div>
  
  </div>
</template>
<style scoped>

.provider-card {
  min-height: 150px;
}

.provider-card-bg {
  opacity: 0.1;
  right: -85%;
  top: 51%;
  transform: scale(6.5);
  transition: transform 0.3s ease;
}
.provider-card:hover .provider-card-bg {
  transform: scale(6.6) rotate(3deg);
}
</style>