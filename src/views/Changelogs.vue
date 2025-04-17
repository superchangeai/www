<template>
    <div class="py-2 w-full">
        <!-- Changelogs -->
        <div class="px-4 md:px-8">
            <div class="mt-2 flex justify-between w-auto">
                <span class="flex gap-3 items-center">
                    <FileText class="h-4 w-4"/>
                    <h2 class="font-semibold">Changelogs</h2>
                </span>
                <router-link :to="`/changelogs/new`" class="no-underline text-inherit">
                    <Button variant="ghost" size="icon">
                        <Plus class="h-5 w-5" />
                    </Button>
                </router-link>
            </div>            
            <div v-if="isLoading">
                <!-- Skeleton loader for changelogs -->
                <div v-for="i in 3" :key="i" class="py-2 border-b">
                    <div class="flex items-center">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div class="ml-auto">
                            <div class="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="changelogs && changelogs.length > 0">
                <div v-for="(changelog, index) in changelogs" :key="index" class="py-2 border-b">
                    <div class="flex items-center">
                        <div class="text-sm flex-1 text-left">
                            {{ changelog.name }}
                            <Badge v-if="changelog.is_public" class="ml-2">Public</Badge>
                            <Badge v-else variant="secondary" class="ml-2">Private</Badge>
                
                            <span class="text-xs text-muted-foreground ml-2">
                            {{ changelog.providers?.length || 0 }} {{ (changelog.providers?.length || 0) > 1 ? 'providers' : 'provider' }}
                            </span>
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
                                        <router-link :to="`/changelogs/${changelog.changelog_id}`" class="p-2 hover:bg-muted text-sm no-underline text-inherit">
                                            View
                                        </router-link>
                                        <button 
                                            @click="openShareDialog(changelog.id, changelog.changelog_id)" 
                                            class="p-2 hover:bg-muted text-sm text-left"
                                        >
                                            Sharing
                                        </button>
                                        <button 
                                            @click="openRemoveDialog(changelog.id, changelog.changelog_id)" 
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
                No changelogs created yet. <router-link :to="`/changelogs/new`">Create your first changelog.</router-link>
            </div>
        </div>
    </div>
    
    <!-- Alert Dialog for Remove Confirmation -->
    <AlertDialog :open="isRemoveDialogOpen" @update:open="isRemoveDialogOpen = $event">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to remove this changelog?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this changelog and all its settings.
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

    <!-- Share URL Dialog -->
    <Dialog :open="isShareDialogOpen" @update:open="(val) => { isShareDialogOpen = val; if (!val) fetchChangelogs(); }">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                  Sharing settings
                  <Loader2 v-if="isSaving" class="ml-2 inline h-4 w-4 animate-spin align-middle" />
                </DialogTitle>
                <DialogDescription>
                    {{ isPublicAccess ? 'Anyone with this link can view this changelog.' : 'Only you have access to view this changelog.' }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex items-center space-x-2 mb-4">
                <Switch v-model="isPublicAccess" @update:modelValue="handleVisibilitySwitch" :disabled="isSaving" />
                <Label>Public access</Label>
            </div>
            <div v-if="isPublicAccess && shareUrl" class="flex items-center space-x-2">
                <div class="grid flex-1 gap-2">
                    <Label for="link" class="sr-only">Link</Label>
                    <Input
                        id="link"
                        v-model="shareUrl"
                        readonly
                    />
                </div>
                <Button type="submit" size="sm" class="px-3" @click="copyShareUrl">
                    <span class="sr-only">Copy</span>
                    <Copy class="h-4 w-4" />
                </Button>
            </div>
            <DialogFooter class="sm:justify-between">
                <DialogClose asChild :disabled="isSaving">
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { Plus, Ellipsis, FileText, Copy, Loader2 } from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ref, onMounted, inject } from 'vue'
import { changelogsService } from '@/api/services/changelogs.service'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const isLoading = ref(false)
const setSettingsLoading = inject('setSettingsLoading', null)
const changelogs = ref([])

// Remove dialog state
const isRemoveDialogOpen = ref(false)
const changelogToRemove = ref({
    id: null,
    changelog_id: null
})

// Share dialog state
const isShareDialogOpen = ref(false)
const shareUrl = ref('')
const isPublicAccess = ref(true)
const originalIsPublic = ref(false)
const isSaving = ref(false)
const changelogToChange = ref(null)

// Function to open the remove dialog
const openRemoveDialog = (id, changelog_id) => {
    changelogToRemove.value = { id, changelog_id }
    isRemoveDialogOpen.value = true
}

// Function to confirm and execute the remove action
const confirmRemove = async () => {
    if (!changelogToRemove.value.id) return
    try {
        isLoading.value = true
        if (setSettingsLoading) setSettingsLoading(true)
        // Delete the changelog from DB
        await changelogsService.delete(changelogToRemove.value.id)
        // Clean up localStorage if the deleted changelog was selected
        // This is to avoid having a selected changelog that no longer exists
        const selectedChangelog = localStorage.getItem('superchange_selected_changelog')
        if (selectedChangelog === changelogToRemove.value.changelog_id) {
            localStorage.removeItem('superchange_selected_changelog')
        }
        // Refresh the changelogs list
        await fetchChangelogs()
        toast({
            title: 'Changelog removed',
            description: 'Your changelog has been successfully removed.',
        })
    } catch (error) {
        console.error('Error removing changelog:', error)
        toast({
            title: 'Error',
            description: 'Failed to remove the changelog',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(false)
        isRemoveDialogOpen.value = false
        changelogToRemove.value = { id: null, changelog_id: null }
    }
}

// Function to edit the visibility of a changelog
const openShareDialog = (id, changelog_id) => {
    changelogToChange.value = id
    isShareDialogOpen.value = true
    shareUrl.value = `https://superchange.ai/changelog/${changelog_id}`
    const changelog = changelogs.value.find(c => c.id === id)
    if (changelog) {
        originalIsPublic.value = changelog.is_public
        isPublicAccess.value = changelog.is_public
    }
}

// Function to handle visibility changes
const handleVisibilitySwitch = async () => {
    isSaving.value = true
    try {
        const changelog = changelogs.value.find(c => c.id === changelogToChange.value)
        if (changelog) {
            await changelogsService.update(changelog.id, {
                name: changelog.name,
                is_public: isPublicAccess.value
            })
            if (isPublicAccess.value) {
                shareUrl.value = `https://superchange.ai/changelog/${changelog.changelog_id}`
            } else {
                shareUrl.value = ''
            }
        }
    } catch (error) {
        console.error('Error updating changelog visibility:', error)
        toast({
            title: 'Error',
            description: 'Failed to update changelog visibility',
            variant: 'destructive',
        })
    } finally {
        isSaving.value = false
    }
}

// Function to copy share URL to clipboard
const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl.value)
    toast({
        title: 'Copied',
        description: 'Share URL copied to clipboard',
    })
}

onMounted(async () => {
    // Fetch changelogs
    await fetchChangelogs()
})

// Function to fetch changelogs in the view
const fetchChangelogs = async () => {
    try {
        isLoading.value = true
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(true)
        const changelogsData = await changelogsService.getAll()
        changelogs.value = changelogsData
    } catch (error) {
        console.error('Error fetching changelogs:', error)
        toast({
            title: 'Error',
            description: 'Failed to load changelogs',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(false)
    }
}
</script>