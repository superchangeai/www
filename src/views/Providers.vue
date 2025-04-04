<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router';
import { formatDistanceToNow } from 'date-fns'
import { providersService } from '@/api/services/providers.service';
import { computed } from 'vue';
import { useCheckedProviders } from '@/composables/useCheckedProviders';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthDrawer } from '@/composables/useAuthDrawer';
import { authStore } from '@/stores/auth';
import AuthDrawer from '@/components/AuthDrawer.vue'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Bot,
  Bell,
  Cloud,
  Contact,
  CreditCard,
  Mail,
  Library,
  Zap
} from 'lucide-vue-next'
import Header from '@/components/Header.vue'

const providers = ref([])
const isLoading = ref(true)
const error = ref(null)

// derive title and icon based on params
const route = useRoute()
const providerType = computed(() => route.params.type || 'all')
const providerTypeMap = {
  all: {
    title: 'All providers',
    icon: Zap
  },
  ai: {
    title: 'AI providers',
    icon: Bot
  },
  cloud: {
    title: 'Cloud service providers',
    icon: Cloud
  },
  crm: {
    title: 'CRM providers',
    icon: Contact
  },
  email: {
    title: 'Email providers',
    icon: Mail
  },
  payment: {
    title: 'Payment providers',
    icon: CreditCard
  },
  more: {
    title: 'Other providers',
    icon: Library
  }
}

const fetchProviders = async () => {
  try {
    isLoading.value = true
    const category = providerType.value === 'all' ? undefined : providerType.value
    const data = await providersService.getAll({ category })
    providers.value = data.map(provider => ({
      id: provider.id.toString(),
      title: provider.name,
      value: provider.name.toLowerCase().replace(/\s+/g, ''),
      update: provider.last_change ? formatDistanceToNow(new Date(provider.last_change), { addSuffix: true }) : 'Never',
      category: provider.category?.name?.toLowerCase() || 'more',
      checked: false
    }))
  } catch (err) {
    error.value = err.message
    console.error('Error fetching providers:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProviders()
})

// refresh data when route changes
watch(providerType, () => {
  fetchProviders()
})

const { updateCheckedProviders, checkedProvidersParams } = useCheckedProviders()
const { checkedProvidersCount } = useCheckedProviders()
// config the header title and icon
const currentProviderConfig = computed(() => providerTypeMap[providerType.value] || providerTypeMap.all)

// Auth drawer setup
const { isOpen, options, open } = useAuthDrawer()
const handleNotify = () => {
  const redirectPath = '/alerts/new' + checkedProvidersParams.value;
  
  // Check if user is authenticated
  if (authStore.session) {
    // User is authenticated, redirect directly
    window.location.href = redirectPath;
  } else {
    // User is not authenticated, open auth drawer
    open({
      title: 'Stay on top of changes from selected providers',
      description: 'Superchange members can search history and create alerts',
      redirectPath: redirectPath
    })
  }
}

const emailSubject = ref('')

const sendEmail = () => {
  const subject = encodeURIComponent(emailSubject.value)
  const body = encodeURIComponent("I would like to see more API provider(s) added to the list, here's why: \n-\n-")
  const mailto = atob('ZmVlZGJhY2tAYXBpd3RoLmFp')
  const mailtoLink = `mailto:${mailto}?subject=Want to track API provider(s): ${subject}&body=${body}`
  window.open(mailtoLink, '_blank')
}

</script>

<template>
      <Header 
      :title="currentProviderConfig.title"
      :icon="currentProviderConfig.icon"
      :is-loading="isLoading"
      :show-filter-button="false" 
      :show-help-button="true"
    >
      <template #actions>
        <Button @click="handleNotify" v-if="checkedProvidersCount > 0">
          <Bell class="mr-2 h-4 w-4" /> Create an alert <Badge>{{ checkedProvidersCount }}</Badge>
        </Button>
      </template>
    </Header>
  <div class="py-2">
    <div class="px-11">
      <!-- Skeleton loading state -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="i in 6" :key="i" class="provider-card">
          <CardHeader class="flex flex-row items-top justify-between space-y-2 pb-4 border-b">
            <div class="text-left inline-flex items-baseline gap-2">
              <Skeleton class="h-6 w-32" />
            </div>
            <Skeleton class="h-6 w-6" />
          </CardHeader>
          <CardFooter>
            <div class="flex items-center pt-4 text-sm text-muted-foreground">
              <Skeleton class="h-4 w-24" />
            </div>
          </CardFooter>
        </Card>
      </div>
      <!-- Empty state when no providers are available -->
      <div v-else-if="providers.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">No providers available</h3>
          <p class="text-muted-foreground mb-4">There are currently no providers listed in this category. Check back later or explore other categories.</p>
          <router-link to="/providers/all">
            <Button variant="outline">View all providers</Button>
          </router-link>
        </div>
      </div>
      <!-- Actual content -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="item in providers" class="provider-card">
          <CardHeader class="flex flex-row items-top justify-between space-y-2 pb-4 border-b">
            <div class="text-left inline-flex items-baseline gap-2">
              <router-link :to="`/providers/${providerType}/${item.id}`">
                <h3 class="text-lg font-semibold hover:underline text-black dark:text-white">{{item.title}}</h3>
              </router-link>                            
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Checkbox
                  v-model="item.checked"
                  @update:modelValue="() => { updateCheckedProviders(item.value, item.checked); }"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Check to create alert</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardFooter>
            <div class="flex items-center pt-4 text-sm text-muted-foreground">
              <span>Last updated: {{item.update}}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      <br>
      <Card class="providercta-card relative overflow-hidden">
        <CardHeader class="relative z-10">
          <h3 class="text-lg font-semibold">Bring more API providers here</h3>
          <p class="text-muted-foreground text-sm">We will grow this list with you. Please tell us what you would want to track!</p>
        </CardHeader>
        <CardContent class="flex gap-2 relative z-10">
          <Input v-model="emailSubject" @keydown.enter="sendEmail" placeholder="What API do you want to see in this list?" class="basis-2/3"></Input>
          <Button
            class="shrink-0 basis-1/3"
            variant="secondary"
            @click="sendEmail"
          >
            Add provider
          </Button>
        </CardContent>
        <div class="providercta-card-bg absolute inset-0 pointer-events-none">
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
    </div>
  </div>
  
  <!-- Auth drawer component -->
  <AuthDrawer
    v-model:isOpen="isOpen"
    v-bind="options"
    @success="options.onSuccess?.()"
  />
</template>

<style scoped>
.providercta-card {
  min-height: 150px;
}

.providercta-card-bg {
  opacity: 0.1;
  right: -147%;
  top: 51%;
  transform: scale(5.5);
  transition: transform 0.3s ease;
}

.providercta-card:hover .providercta-card-bg {
  transform: scale(5.6) rotate(3deg);
}
</style>