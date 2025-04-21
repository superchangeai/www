<template>
    <div class="py-2 w-full">
        <!-- Emails -->
        <div class="px-4 md:px-8">
            <div class="mt-2 flex justify-between w-auto">
                <span class="flex gap-3 items-center">
                    <Inbox class="h-4 w-4"/>
                    <h2 class="font-semibold">Your emails</h2>
                </span>
                <router-link :to="`/settings/channels/new`" class="no-underline text-inherit">
                    <Button variant="ghost" size="icon">
                        <Plus class="h-5 w-5" />
                    </Button>
                </router-link>
            </div>            
            <div v-if="isLoading">
                <!-- Skeleton loader for emails -->
                <div v-for="i in 1" :key="i" class="py-2 border-b">
                    <div class="flex items-center">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div class="ml-auto">
                            <div class="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="channels.email && channels.email.length > 0">
                <div v-for="(email, index) in channels.email" :key="index" class="py-2 border-b">
                    <div class="flex items-center">
                        <div class="text-sm flex-1 text-left">
                            {{ email.email_to }} ({{ formatFrequency(email.frequency_level) }}) <Badge v-if="!email.verified" variant="destructive">Unverified</Badge>
                        </div>
                            
                        <div class="text-xs whitespace-nowrap shrink-0 ml-4">
                            <Popover>
                                <PopoverTrigger>
                                    <Button variant="ghost" size="icon">
                                        <Ellipsis class="h-3 w-3" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent class="w-40 p-0">
                                    <div class="flex flex-col">
                                        <router-link :to="`/settings/channels/edit/?email=${email.id}`" class="p-2 hover:bg-muted text-sm no-underline text-inherit">
                                            Edit
                                        </router-link>
                                        <button 
                                            @click="openRemoveDialog(email.id)" 
                                            class="p-2 hover:bg-muted text-sm text-left text-destructive"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="py-2 text-muted-foreground text-left text-sm">
                No emails added yet. <router-link :to="`/settings/channels/new`">Configure an email.</router-link>
            </div>
        </div>
        <!-- Slack -->
        <div class="px-4 md:px-8 opacity-50">
            <div class="mt-6 flex justify-between w-auto">
                <span class="flex gap-3 items-center">
                    <Slack class="h-4 w-4"/>
                    <h2 class="font-semibold">Slack</h2>
                </span>
                <router-link :to="`/settings/channels/new`" class="no-underline text-inherit cursor-not-allowed">
                    <Button variant="ghost" size="icon" disabled>
                        <Plus class="h-5 w-5" />
                    </Button>
                </router-link>
            </div>            
            <div v-if="channels.slack && channels.slack.length > 0">
                <div v-for="(slack, index) in channels.slack" :key="index" class="py-2 border-b">
                    <div class="flex items-center">
                        <div class="text-sm text-muted-foreground flex-1 text-left">
                            {{ slack.to }}
                        </div>
                        <div class="text-xs text-muted-foreground whitespace-nowrap shrink-0 ml-4">
                            <Button variant="ghost" size="icon">
                                <Ellipsis class="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="py-2 text-muted-foreground text-left text-sm">
                Slack integration coming next.
            </div>
            <!-- <div v-else class="py-2 text-muted-foreground text-left text-sm">
                No slack channels added yet. <router-link :to="`/settings/channels/new`">Configure your slack integrations.</router-link>
            </div> -->
        </div>
        <!-- Webhook -->
        <div class="px-4 md:px-8 opacity-50">
            <div class="mt-6 flex justify-between w-auto">
                <span class="flex gap-3 items-center">
                    <Slack class="h-4 w-4"/>
                    <h2 class="font-semibold">Incoming webhooks</h2>
                </span>
                <router-link :to="`/settings/channels/new`" class="no-underline text-inherit cursor-not-allowed">
                    <Button variant="ghost" size="icon" disabled>
                        <Plus class="h-5 w-5" />
                    </Button>
                </router-link>
            </div>            
            <div v-if="channels.webhook && channels.webhook.length > 0">
                <div v-for="(webhook, index) in channels.webhook" :key="index" class="py-2 border-b">
                    <div class="flex items-center">
                        <div class="text-sm text-muted-foreground flex-1 text-left">
                            {{ webhook.to }}
                        </div>
                        <div class="text-xs text-muted-foreground whitespace-nowrap shrink-0 ml-4">
                            <Button variant="ghost" size="icon">
                                <Ellipsis class="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="py-2 text-muted-foreground text-left text-sm">
                Hooks coming later.
            </div>
            <!-- <div v-else class="py-2 text-muted-foreground text-left text-sm">
                No webhooks created yet. <router-link :to="`/settings/channels/new`">Configure your webhooks.</router-link>
            </div> -->
        </div>        
    </div>
    
    <!-- Alert Dialog for Remove Confirmation -->
    <AlertDialog :open="isRemoveDialogOpen" @update:open="isRemoveDialogOpen = $event">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to remove this channel?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will remove this email channel and interrupt any alert associated.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="isRemoveDialogOpen = false">Cancel</AlertDialogCancel>
                <AlertDialogAction @click="confirmRemove" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remove
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
<script setup>
import {
    Plus,
    Ellipsis,
    Inbox,
    Webhook,
    Slack
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ref, onMounted, h, inject } from 'vue'
import { useRoute } from 'vue-router'
import { emailChannelsService } from '@/api/services/email-channels.service'
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'
const { toast } = useToast()

const route = useRoute()
const isLoading = ref(false)
const setSettingsLoading = inject('setSettingsLoading', null)
const channels = ref({
    email: [],
    slack: [],
    webhooks: []
})

// Remove dialog state
const isRemoveDialogOpen = ref(false)
const channelToRemove = ref(null)

// Function to open the remove dialog
const openRemoveDialog = (channelId) => {
    channelToRemove.value = channelId
    isRemoveDialogOpen.value = true
}

// Function to confirm and execute the remove action
const confirmRemove = async () => {
    if (!channelToRemove.value) return
    
    try {
        isLoading.value = true
        if (setSettingsLoading) setSettingsLoading(true)
        await emailChannelsService.delete(channelToRemove.value)
        
        // Refresh the email channels list
        await fetchEmailChannels()
        
        toast({
            title: 'Channel removed',
            description: 'The email channel has been successfully removed.',
        })
    } catch (error) {
        console.error('Error revoking email channel:', error)
        toast({
            title: 'Error',
            description: 'Failed to remove the email channel',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(false)
        isRemoveDialogOpen.value = false
        channelToRemove.value = null
    }
}

onMounted(async () => {
    const token = route.query.token
    if (token) {
        isLoading.value = true
        if (setSettingsLoading) setSettingsLoading(true)
        try {
            await emailChannelsService.verify(token)
            // We will want to refresh the channels list here
            await fetchEmailChannels()
            toast({
                title: 'Channel verified',
                description: 'You can now use it to receive Superchange alerts.',
            })
        } catch (error) {
            console.error('Error verifying email:', error)
            toast({
                title: 'Verification failed',
                description: 'Invalid or expired token. Please request a new verification email.',
                variant: 'destructive',
            })
        } finally {
            isLoading.value = false
            // Update parent loading state
            if (setSettingsLoading) setSettingsLoading(false)
        }
    }
    // Fetch email channels
    await fetchEmailChannels()
})

// Function to fetch email channels
const fetchEmailChannels = async () => {
    try {
        isLoading.value = true
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(true)
        const emailChannels = await emailChannelsService.getAll()
        channels.value.email = emailChannels
    } catch (error) {
        console.error('Error fetching email channels:', error)
        toast({
            title: 'Error',
            description: 'Failed to load email channels',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(false)
    }
}

// Function to format frequency level
const formatFrequency = (frequencyLevel) => {
    return frequencyLevel
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
</script>