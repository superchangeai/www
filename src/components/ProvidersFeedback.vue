<template>
    <form @submit.prevent="handleSubmit" class="flex gap-2 flex-col md:flex-row items-start justify-between w-full">
        <Input
        v-model="providers"
        class="basis-3/4 w-full min-h-[30px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
        placeholder="Which API provider(s) would you like to see on Superchange?"
        />
        <Button variant="secondary" class="basis-1/4 w-full m-0 py-2 font-normal">
            <MessageSquare class="h-4 w-4" />
            {{ isSubmitting ? 'Sending...' : 'Request provider' }}
        </Button>
    </form>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare } from 'lucide-vue-next'
import { feedbackService } from '@/api/services/feedback.service';
import { authStore } from '../stores/auth'
import { toast } from '@/components/ui/toast'

const providers = ref('')
const isSubmitting = ref(false)
const handleSubmit = async () => {
    isSubmitting.value = true
    try {
        await feedbackService.createProvidersFeedback({
            providers: providers.value,
            userId: authStore.session?.user?.id
        });

        providers.value = ''
            toast({
            title: 'Request received.',
            description: 'Thank you for your provider request!',
            duration: 3000
        })
    } catch (error) {
        console.error('Error submitting provider request:', error)
        toast({
            title: 'Error',
            description: 'Failed to send this request',
            variant: 'destructive',
            duration: 3000
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>