<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import Header from '@/components/Header.vue'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useRouter } from 'vue-router'


const { toast } = useToast()
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'
  import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  } from '@/components/ui/command'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, ref, watch, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { z } from 'zod'
import {
    Bell,
    Inbox,
    Webhook,
    Slack,
    ChevronDown,
    Check
} from 'lucide-vue-next'
import { providersService } from '@/api/services/providers.service'
import { emailChannelsService } from '@/api/services/email-channels.service'
import { alertSubscriptionsService } from '@/api/services/alert-subscriptions.service'

const route = useRoute()

const providerValue = ref<string[]>([])
const updatesValue = ref<string[]>([]);

const showChannelDialog = ref(false)
const selectedChannel = ref('')
const router = useRouter()

watch(showChannelDialog, (newValue) => {
    if (newValue) {
        fetchEmailChannels()
    }
})

const formSchema = toTypedSchema(z.object({
    providers: z.array(z.number()).min(1),
    classifications: z.array(z.string()).min(1),
    email_channel_id: z.number().optional()
}).refine((data) => {
    return data.email_channel_id !== undefined
}, {
    message: 'Please select at least one channel'
}))

// Initialize form with route params if they exist
const initialProviders = computed(() => {
    const routeProviders = route.query.providers
    if (!routeProviders) return []
    
    const providers = Array.isArray(routeProviders) ? routeProviders : [routeProviders]
    return providers.map(name => String(name).toLowerCase().replace(/[^a-z0-9]/g, ''))
})

const initialUpdates = computed(() => {
    const routeUpdates = route.query.updates
    if (routeUpdates) {
        return Array.isArray(routeUpdates) 
        ? routeUpdates.map(update => String(update))
        : [String(routeUpdates)]
    }
    return [] as string[]
})

const selectedProvidersValues = ref(new Set(initialProviders.value))
const providersList = ref<{ label: string; value: string; id: number }[]>([])
const fetchProviders = async () => {
  try {
    const providers = await providersService.getAll()
    providersList.value = providers.map(provider => ({
      label: provider.name,
      value: provider.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      id: provider.id
    }))
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to load providers. Please try again later.',
      variant: 'destructive'
    })
  }
}

// Define types for channel options
type ChannelOptionObject = {
  label: string;
  value: string;
  id: number;
};

type ChannelOption = string | ChannelOptionObject;

type Channel = {
  value: string;
  label: string;
  icon: any;
  options: ChannelOption[];
  disabled: boolean;
};

const channels: Channel[] = [
    { value: 'email', label: 'Email', icon: Inbox, options: [], disabled: false }, // Initialize with empty options
    { value: 'slack', label: 'Slack channel', icon: Slack, options: ['#general', '#updates', '#announcements'], disabled: true },
    { value: 'webhook', label: 'Incoming Webhook', icon: Webhook, options: ['https://webhook.site/123', 'https://api.example.com/webhook'], disabled: true }
]

const fetchEmailChannels = async () => {
  try {
    const emailChannels = await emailChannelsService.getAll()
    const emailChannel = channels.find(c => c.value === 'email')
    if (emailChannel) {
      emailChannel.options = emailChannels.map(channel => {
        const formattedFrequency = channel.frequency_level
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        return {
          label: `${channel.email_to} (${formattedFrequency})`,
          value: channel.id.toString(),
          id: channel.id
        }
      })
    }
  } catch (error) {
    console.error('Error fetching email channels:', error)
    toast({
      title: 'Error',
      description: 'Failed to load email channels. Please try again later.',
      variant: 'destructive'
    })
  }
}

const toggleProvidersSelection = (optionValue: string) => {
  const provider = providersList.value.find(p => p.value === optionValue)
  if (!provider) return
  
  if (selectedProvidersValues.value.has(optionValue)) {
    selectedProvidersValues.value.delete(optionValue)
    providerIds.value = providerIds.value.filter(id => id !== provider.id)
  } else {
    selectedProvidersValues.value.add(optionValue)
    providerIds.value.push(provider.id)
  }
  
  setFieldValue('providers', providerIds.value)
}
const providerIds = ref<number[]>([])

const selectedUpdatesValues = ref(new Set(initialUpdates.value))
const updatesList = ref([
{ value: 'breaking', label: 'Breaking changes' },
{ value: 'security', label: 'Security updates' },
{ value: 'performance', label: 'Performance improvements'},
{ value: 'new_feature', label: 'New features' },
{ value: 'minor_fix', label: 'Minor fixes'},
{ value: 'other', label: 'Other' }
])

const toggleUpdatesSelection = (optionValue: string) => {
  selectedUpdatesValues.value.has(optionValue)
    ? selectedUpdatesValues.value.delete(optionValue)
    : selectedUpdatesValues.value.add(optionValue)
  updatesValue.value = Array.from(selectedUpdatesValues.value)
  setFieldValue('classifications', updatesValue.value)
}

const { handleSubmit, setFieldValue } = useForm({
    validationSchema: formSchema,
    initialValues: {
        providers: [], // Will be populated with IDs
        classifications: initialUpdates.value as string[],
        email_channel_id: undefined
    }
})

const isLoading = ref(false)

const onSubmit = handleSubmit(async (values, { resetForm }) => {
    isLoading.value = true
    try {
        // Make API call
        await alertSubscriptionsService.create({
            email_channel_id: values.email_channel_id as number,
            providers: values.providers,
            classifications: values.classifications
        })
        
        // Show success toast
        toast({
            title: 'Alert created',
            description: 'You will be notified whenever a new update is available',
            duration: 5000, // 5 seconds
        })
        
        // Reset form
        resetForm()
        
        // Redirect after toast duration
        setTimeout(() => {
            router.push('/alerts')
        }, 5000)
    } catch (err) {
        toast({
            title: 'Error',
            description: 'Failed to create alert. Please try again.',
            variant: 'destructive'
        })
    } finally {
        isLoading.value = false
    }
}, () => {
    toast({
        title: 'Missing fields',
        description: 'Please complete all required fields * and submit again.',
        action: h(ToastAction, {
          altText: 'Try again',
        }, {
          default: () => 'Try again',
        }),
        variant: 'destructive'
    })
})

onMounted(async () => {
    await fetchProviders()
    await fetchEmailChannels()
    
    // Map provider names to IDs after providers are fetched
    if (initialProviders.value.length > 0) {
        const initialProviderIds = providersList.value
            .filter(p => initialProviders.value.includes(p.value))
            .map(p => p.id)
        
        providerIds.value = initialProviderIds
        setFieldValue('providers', initialProviderIds)
        
        // Update the UI selection
        initialProviders.value.forEach(value => {
            selectedProvidersValues.value.add(value)
        })
    }

    if (initialUpdates.value.length > 0) {
        updatesValue.value = initialUpdates.value as string[]
        setFieldValue('classifications', initialUpdates.value as string[])
    }
})

watch(providerValue, (newValue) => {
    setFieldValue('providers', newValue.map(Number))
}, { deep: true })

watch(updatesValue, (newValue) => {
    setFieldValue('classifications', newValue)
}, { deep: true })

const openChannelDialog = (channelType: string) => {
    selectedChannel.value = channelType
    showChannelDialog.value = true
}

// Define a type for channel selections to fix indexing issues
type ChannelSelections = Record<string, string[]>;
const channelSelections = ref<ChannelSelections>({});

// Helper function to safely access channel selections
const getChannelSelections = (channelValue: string): string[] => {
  return channelSelections.value[channelValue] || [];
};

// Helper function to safely set channel selections
const setChannelSelections = (channelValue: string, selections: string[]): void => {
  channelSelections.value[channelValue] = selections;
};

// Update the addChannel function to handle AcceptableValue type
const addChannel = (value: string | null) => {
    if (value === null) return;
    if (selectedChannel.value === 'email') {
        const channelId = parseInt(value, 10)
        if (!isNaN(channelId)) {
            setFieldValue('email_channel_id', channelId)
            
            // For display purposes, store the selected channel label
            const emailChannel = channels.find(c => c.value === 'email')
            const selectedOption = emailChannel?.options.find(opt => typeof opt === 'object' && (opt as ChannelOptionObject).value === value) as ChannelOptionObject | undefined
            if (selectedOption) {
                setChannelSelections('email', [selectedOption.label])
            }
        }
    }
    showChannelDialog.value = false
}
const clearProvidersSelections = () => {
  selectedProvidersValues.value.clear()
  providerValue.value = []
  setFieldValue('providers', [])
}
const clearUpdatesSelections = () => {
  selectedUpdatesValues.value.clear()
  updatesValue.value = []
  setFieldValue('classifications', [])
}
const hasProvidersSelections = computed(() => selectedProvidersValues.value.size > 0)
const hasUpdatesSelections = computed(() => selectedUpdatesValues.value.size > 0)

</script>

<template>
    <Header 
      :title="'Create an alert'"
      :icon="Bell"
      :show-filter-button="false" 
      :show-help-button="true"
      :is-loading="isLoading"
    >
    </Header>
    <div class="py-4 text-left px-4 md:px-11">
        <form class="w-full md:w-3/4 space-y-6 pb-10" @submit="onSubmit">
            <FormField name="providers">
                <FormItem>
                    <FormLabel class="text-md"><h2 class="py-2">1. Pick providers you want to watch *</h2></FormLabel>              
                    <FormControl>
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button
                                    variant="outline"
                                    class="flex h-[52px] justify-between font-normal text-muted-foreground w-full overflow-auto"
                                >
                                <span v-if="selectedProvidersValues.size < 1">Select...</span>
                                <template v-else>
                                    <div class="flex space-x-1">
                                        <Badge
                                          v-for="option in providersList.filter(o => selectedProvidersValues.has(o.value))"
                                          :key="option.value"
                                          variant="secondary"
                                          class="rounded-sm px-1 font-normal"
                                        >
                                          {{ option.label }}
                                        </Badge>
                                    </div>
                                </template>
                                <ChevronDown class="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent class="p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search..." />
                                <CommandList>
                                    <CommandEmpty>No results found</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                          v-for="option in providersList"
                                          :key="option.value"
                                          :value="option.value"
                                          @select="toggleProvidersSelection(option.value)"
                                        >
                                        <div
                                          :class="[
                                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                            selectedProvidersValues.has(option.value)
                                              ? 'bg-primary text-primary-foreground'
                                              : 'opacity-50 [&_svg]:invisible'
                                          ]"
                                        >
                                          <Check class="h-4 w-4" />
                                        </div>
                                        <span>{{ option.label }}</span>
                                        </CommandItem>
                                    </CommandGroup>
                                    <template v-if="hasProvidersSelections">
                                       <div class="sticky bottom-0 bg-background">
                                        <CommandSeparator />
                                        <CommandGroup>
                                        <CommandItem
                                            value="clear-providers"
                                            class="justify-center text-center"
                                            @select="clearProvidersSelections"
                                        >
                                            Clear selection
                                        </CommandItem>
                                        </CommandGroup>
                                        </div>
                                </template>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormControl>
                <FormDescription>
                    Select one or many providers in our ecosystem.
                    <router-link to="/providers">
                        Browse all providers
                    </router-link>
                </FormDescription>
                <FormMessage />
                </FormItem>
            </FormField>
            <FormField name="updates">
                <FormItem>
                    <FormLabel class="text-md"><h2 class="py-2">2. Choose updates you need to get *</h2></FormLabel>              
                    <FormControl>
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button
                                    variant="outline"
                                    class="flex h-[52px] justify-between font-normal text-muted-foreground w-full overflow-auto"
                                >
                                <span v-if="selectedUpdatesValues.size < 1">Select...</span>
                                <template v-else>
                                    <div class="flex space-x-1">
                                        <Badge
                                          v-for="option in updatesList.filter(o => selectedUpdatesValues.has(o.value))"
                                          :key="option.value"
                                          variant="secondary"
                                          class="rounded-sm px-1 font-normal"
                                        >
                                          {{ option.label }}
                                        </Badge>
                                    </div>
                                </template>
                                <ChevronDown class="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent class="p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search..." />
                                <CommandList>
                                    <CommandEmpty>No results found</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                          v-for="option in updatesList"
                                          :key="option.value"
                                          :value="option.value"
                                          @select="toggleUpdatesSelection(option.value)"
                                        >
                                        <div
                                          :class="[
                                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                            selectedUpdatesValues.has(option.value)
                                              ? 'bg-primary text-primary-foreground'
                                              : 'opacity-50 [&_svg]:invisible'
                                          ]"
                                        >
                                          <Check class="h-4 w-4" />
                                        </div>
                                        <span>{{ option.label }}</span>
                                        </CommandItem>
                                    </CommandGroup>
                                    <template v-if="hasUpdatesSelections">
                                       <div class="sticky bottom-0 bg-background">
                                        <CommandSeparator />
                                        <CommandGroup>
                                        <CommandItem
                                            value="clear-updates"
                                            class="justify-center text-center"
                                            @select="clearUpdatesSelections"
                                        >
                                            Clear selection
                                        </CommandItem>
                                        </CommandGroup>
                                        </div>
                                </template>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormControl>
                <FormDescription>
                    Select updates you can't miss.
                </FormDescription>
                <FormMessage />
        </FormItem>
            </FormField>                
    <FormField name="channels">
        <FormItem>
            <FormLabel class="text-md"><h2 class="py-2">3. Select channels to route your alert *</h2></FormLabel>              
            <FormControl>
                <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card 
                        v-for="channel in channels" 
                        :key="channel.value" 
                        :class="[
                            'relative',
                            channel.disabled ? 'opacity-50 bg-muted cursor-not-allowed' : 'hover:bg-accent'
                        ]"
                    >
                        <CardHeader class="flex flex-col space-y-4 text-sm">
                            <div class="flex flex-row items-center gap-4">
                                <component :is="channel.icon" class="mr-2 h-4 w-4 flex-none md:inline sm:hidden" />
                                <div class="flex-auto flex-col space-y-1.5 text-md font-semibold">
                                    {{ channel.label }}
                                </div>
                                <Checkbox 
                                    class="ml-auto" 
                                    :disabled="channel.disabled"
                                    :checked="getChannelSelections(channel.value).length > 0" 
                                    @click="() => {
                                        if (channel.disabled) return;
                                        if (getChannelSelections(channel.value).length === 0) {
                                            openChannelDialog(channel.value)
                                        } else {
                                            setChannelSelections(channel.value, [])
                                            // Remove the channels field as it's not in the form schema
                                        }
                                    }" 
                                />
                            </div>
                            <template v-if="getChannelSelections(channel.value).length > 0">
                                <Separator />
                                <div class="text-sm text-muted-foreground truncate">
                                    {{ getChannelSelections(channel.value).join(', ') }}
                                </div>
                            </template>
                        </CardHeader>
                    </Card>
                </div>
            </FormControl>
            <FormDescription>
                Add one or multiple channels to receive the alert.
                <router-link to="/settings/channels/" class="font-medium">
                    Manage your channels in the settings.
                </router-link>
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>    
    <Button type="submit">
        <Bell /> Create alert
    </Button>
    <br>
        </form>

        <Dialog v-model:open="showChannelDialog">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Receive updates via email</DialogTitle>
                    <DialogDescription v-if="channels.find(c => c.value === 'email')?.options.length">
                        Choose an existing channel or <router-link to="/settings/channels/new" target="_blank" @click="showChannelDialog = false">create a new one.</router-link>
                    </DialogDescription>
                    <DialogDescription v-else>
                        You do not have an email channel set up yet. <router-link to="/settings/channels/new" target="_blank" @click="showChannelDialog = false">Add an email now.</router-link>
                    </DialogDescription>
                </DialogHeader>
                <Select v-if="channels.find(c => c.value === 'email')?.options.length" @update:modelValue="(value) => addChannel(value as string)">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem v-for="option in channels.find(c => c.value === selectedChannel)?.options || []" 
                                :key="typeof option === 'object' ? (option as ChannelOptionObject).id : option" 
                                :value="typeof option === 'object' ? (option as ChannelOptionObject).value : option">
                                {{ typeof option === 'object' ? (option as ChannelOptionObject).label : option }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <DialogFooter>
                    <Button variant="outline" @click="showChannelDialog = false">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>


