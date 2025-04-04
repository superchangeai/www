<template>
    <Popover v-model:open="isOpen" class="w-full justify-start font-normal">
        <PopoverTrigger class="w-full justify-start font-normal">
            <Button variant="ghost" class="w-full justify-start font-normal">
                <MessageSquare class="mr-2 h-4 w-4" />
                Feedback
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[350px] p-4 mx-3">
            <div class="space-y-4">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="space-y-2">
                        <textarea
                        v-model="feedback"
                        class="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder="Ideas on how to improve this page..."
                        />
                    </div>
                    
                    <div class="flex items-center justify-between  gap-2">
                        
                        <div class="flex items-center gap-2 text-sm">
                            <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            class="text-xs"
                            @click="closePopover"
                            >
                            Cancel
                        </Button>
                        <Button 
                        type="button" 
                        variant="outline" 
                        @click="resetPopover"
                        size="sm"
                        class="text-xs"
                        >
                        Reset
                    </Button>
                </div>
                
                
                <div class="flex items-center gap-2 text-sm">
                    <Button 
                    type="submit" 
                    :disabled="!feedback || isSubmitting"
                    size="sm"
                    class="text-xs"
                    >
                    {{ isSubmitting ? 'Sending...' : 'Send feedback' }}
                </Button>
            </div>
        </div>
        
        <div class="flex justify-start">
            <a 
            href="https://docs.superchange.ai" 
            target="_blank" 
            class="text-xs text-muted-foreground hover:underline"
            >
            Need technical support?
        </a>
    </div>
</form>
</div>
</PopoverContent>
</Popover>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-vue-next'
import { feedbackService } from '@/api/services/feedback.service';
import { authStore } from '../stores/auth'
import { toast } from '@/components/ui/toast'

const route = useRoute()
const feedback = ref('')
const isSubmitting = ref(false)
const isOpen = ref(false)

const closePopover = () => {
    isOpen.value = false
    resetPopover()
}

const resetPopover = () => {
    feedback.value = ''
}

const handleSubmit = async () => {
    isSubmitting.value = true
    
    try {
                
        await feedbackService.createGlobalFeedback({
            feedback: feedback.value,
            page: route.path,
            userId: authStore.session?.user?.id
        });

        // Reset form
        feedback.value = ''
        
        closePopover()
        toast({
            title: 'Feedback received.',
            description: 'Thank you so much for your contribution!',
            duration: 3000
        })
    } catch (error) {
        console.error('Error submitting feedback:', error)
        toast({
            title: 'Error',
            description: 'Failed to send this feedback',
            variant: 'destructive',
            duration: 3000
        })
    } finally {
        isSubmitting.value = false

    }
}
</script>