<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast/use-toast'
import Header from '@/components/Header.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, FileText, ArrowLeft } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { changelogsService } from '@/api/services/changelogs.service'
import { providersService } from '@/api/services/providers.service'

const { toast } = useToast()
const router = useRouter()
const route = useRoute()

// Get changelog ID from route params
const changelogId = computed(() => {
  return parseInt(route.params.id)
})

// Form validation schema
const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  provider_ids: z.array(z.number()).min(1, 'At least one provider must be selected')
}))

// Form setup
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    provider_ids: [],
  },
})

// Providers data
const providers = ref([])
const changelog = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)
const activeTab = ref('all')

// Toggle provider selection
const toggleProviderSelection = (providerId) => {
  const newProviderIds = form.values.provider_ids?.includes(providerId)
  ? form.values.provider_ids.filter(id => id !== providerId)
  : [...(form.values.provider_ids || []), providerId]
  form.setFieldValue('provider_ids', newProviderIds)
}

// Select all providers in the current tab
const selectAllInCurrentTab = () => {
  const currentTabProviders = filteredProviders.value
  const currentIds = currentTabProviders.map(p => p.id)
  
  // Combine current tab provider IDs with already selected IDs from other tabs
  const otherTabIds = form.values.provider_ids?.filter(id => 
  !currentIds.includes(id)
  ) || []
  
  const newProviderIds = [...new Set([...otherTabIds, ...currentIds])]
  form.setFieldValue('provider_ids', newProviderIds)
}

// Clear selection in the current tab
const clearSelectionInCurrentTab = () => {
  const currentTabProviders = filteredProviders.value
  const currentIds = currentTabProviders.map(p => p.id)
  
  // Keep only IDs that are not in the current tab
  const newProviderIds = form.values.provider_ids?.filter(id => 
  !currentIds.includes(id)
  ) || []
  
  form.setFieldValue('provider_ids', newProviderIds)
}

// Extract unique categories from providers
const categories = computed(() => {
  const uniqueCategories = new Set()
  providers.value.forEach(provider => {
    if (provider && 'category' in provider && provider.category?.name) {
      uniqueCategories.add(provider.category.name)
    }
  })
  return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b))
})

// Filter providers based on selected category
const filteredProviders = computed(() => {
  if (activeTab.value === 'all') {
    return providers.value
  }
  return providers.value.filter(provider => 
  provider.category && provider.category.name === activeTab.value
  )
})

// Fetch changelog and providers on component mount
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Fetch the changelog to edit
    const changelogData = await changelogsService.get(changelogId.value)
    changelog.value = changelogData
    
    // Fetch all providers
    const providersData = await providersService.getAll()
    providers.value = providersData
    
    // Set initial form values from the fetched changelog
    form.setFieldValue('name', changelogData.name)
    
    // Extract provider IDs from the changelog's providers array
    const selectedProviderIds = changelogData.providers.map(provider => provider.id)
    form.setFieldValue('provider_ids', selectedProviderIds)
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to load changelog data',
      variant: 'destructive',
    })
    console.error('Failed to load changelog data:', error)
    // Navigate back to settings if there's an error
    router.push('/settings')
  } finally {
    isLoading.value = false
  }
})

// Submit form handler
const onSubmit = form.handleSubmit(async (values) => {
  isSaving.value = true
  try {
    await changelogsService.update(changelogId.value, {
      name: values.name,
      provider_ids: values.provider_ids
    })
    toast({
      title: 'Success',
      description: 'Changelog updated successfully',
    })
    // Navigate back to the changelog view
    router.push(`/changelogs/${changelog.value.changelog_id}`)
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update changelog',
      variant: 'destructive',
    })
    console.error('Failed to update changelog:', error)
  } finally {
    isSaving.value = false
  }
})

// Go back to previous page
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header 
      :title="'Edit changelog'" 
      :icon="FileText"
      :is-loading="isLoading || isSaving"
      :show-filter-button="false" 
      :show-help-button="true"
    >
      <template #actions>
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="h-5 w-5" />
        </Button>
      </template>
    </Header>
    
    <main class="text-left space-y-6 py-6 px-4 sm:px-4 md:px-10 lg:px-10">
      <p class="text-sm text-muted-foreground">Edit your changelog settings and provider selection.</p>
      
      <div v-if="isLoading" class="flex justify-center items-center py-10">
        <Loader2 class="h-8 w-8 animate-spin" />
      </div>
      
      <form v-else @submit="onSubmit" class="space-y-6">
        <FormField
          :id="'name'"
          :name="'name'"
          v-slot="{ field, errorMessage }"
        >
          <FormItem>
            <Label class="text-md"><h2 class="py-2">1. Changelog name *</h2></Label>
            <FormControl>
              <Input 
                v-bind="field"
                :disabled="isLoading"
              />
            </FormControl>
            <FormMessage v-if="errorMessage">{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
        
        <div class="space-y-2">
          <Label class="text-md"><h2 class="py-2">2. Providers selection</h2></Label>
          
          <!-- Tabs of categories to filter down the divs shown below -->
          <Tabs v-model="activeTab" class="w-full mb-4 overflow-auto" v-if="!isLoading">
            <TabsList class="mb-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger 
                v-for="category in categories" 
                :key="category" 
                :value="category"
              >
                {{ category }}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div 
              v-for="provider in filteredProviders" 
              :key="provider.id"
              class="flex items-center space-x-2 p-2 border rounded-md cursor-pointer"
              @click="toggleProviderSelection(provider.id)"
            >
              <div class="flex-1">
                <div class="font-medium inline-block">{{ provider.name }}</div>
                <div class="inline-block p-1">·</div>
                <div class="text-xs text-muted-foreground inline-block" v-if="provider.category">
                  {{ provider.category.name }}
                </div>
              </div>
              <div>
                <input 
                  type="checkbox"
                  :id="'provider-' + provider.id"
                  :checked="form.values.provider_ids?.includes(Number(provider.id))"
                  @change="toggleProviderSelection(provider.id)"
                  class="ml-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @click.stop
                />
              </div>
            </div>
          </div>
          
          <div class="flex justify-between items-center gap-2">
            <div class="flex justify-start space-x-4 mt-2 pt-2 text-xs">
              <a href="#" @click.prevent="selectAllInCurrentTab" class="hover:underline">Select all</a>
              <a href="#" @click.prevent="clearSelectionInCurrentTab" class="hover:underline">Clear selection</a>
            </div>
            <Router-link to="/providers/all#more" class="text-xs text-muted-foreground space-x-4 mt-2 pt-2">Can't find the provider you need? Make a request here.</Router-link>
          </div>
          <FormMessage v-if="form.errors['provider_ids']">{{ form.errors['provider_ids'] }}</FormMessage>
        </div>
        
        <div class="flex items-center gap-2">
          <Button type="submit" :disabled="isLoading || isSaving">
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            <FileText v-else class="mr-2 h-4 w-4" />
            Save changes
          </Button>
          <Button type="button" variant="outline" @click="goBack">
            Cancel
          </Button>
        </div>
      </form>
    </main>
  </div>
</template>