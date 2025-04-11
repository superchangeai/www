<template>
    <div class="py-2 px-3 md:px-8">
        <div v-if="isLoading" class="flex justify-center items-center py-10">
            <Loader2 class="h-8 w-8 animate-spin" />
        </div>
        <div v-else class="mt-6 text-left">
            <div v-if="channel">
                <!-- Email configuration content -->
                <form class="pb-10" @submit="onSubmit">
                    <FormField name="email-to">
                        <FormItem>
                            <FormLabel class="text-md"><h2 class="py-2">1. Email address:</h2></FormLabel>              
                            <FormControl>
                                <Input placeholder="inbox@" v-model="emailTo" @input="setFieldValue('email-to', emailTo)"></Input>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <div class="flex items-center justify-start mt-4 mb-2">
                        <Button type="button" variant="outline" size="sm" @click="showOptionalFields = !showOptionalFields">
                            {{ showOptionalFields ? '-' : '+' }} optional fields
                        </Button>
                    </div>
                    <div v-show="showOptionalFields" class="flex gap-4 justify-between mb-6">
                        <FormField name="email-cc">
                            <FormItem class="w-full">
                                <FormLabel class="text-md"><h2 class="py-2">Cc:</h2></FormLabel>              
                                <FormControl>
                                    <Input placeholder="copy@, copy@" v-model="emailCc" @input="setFieldValue('email-cc', emailCc)"></Input>
                                </FormControl>
                                <FormDescription>
                                    One to many emails separated by comma
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <FormField name="email-subject">
                            <FormItem class="w-full">
                                <FormLabel class="text-md"><h2 class="py-2">Custom subject:</h2></FormLabel>              
                                <FormControl>
                                    <Input placeholder="Custom subject field" v-model="emailSubject" @input="setFieldValue('email-subject', emailSubject)"></Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>
                    <FormField name="email-frequency">
                        <FormItem>
                            <FormLabel class="text-md"><h2 class="py-2 mt-6">2. Frequency level:</h2></FormLabel>              
                            <FormControl>
                                <div class="space-y-4">
                                    <Slider v-model="frequencyValue" :min="0" :max="2" :step="1" class="w-full" />
                                    <div class="flex justify-between text-sm text-muted-foreground">
                                        <span :class="{ 'text-primary font-medium': frequencyValue[0] === 0 }" class="cursor-pointer" @click="frequencyValue[0] = 0">Weekly digest</span>
                                        <span :class="{ 'text-primary font-medium': frequencyValue[0] === 1 }" class="cursor-pointer" style="position: relative; left:-10px;" @click="frequencyValue[0] = 1">Daily push</span>
                                        <span :class="{ 'text-primary font-medium': frequencyValue[0] === 2 }" class="cursor-pointer" @click="frequencyValue[0] = 2">Fire hose</span>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <!-- Submit button -->
                    <div class="mt-8 flex justify-start gap-4">
                        <Button type="submit" class="w-full md:w-auto">
                            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                            <Save v-else class="mr-2 h-4 w-4" />
                            {{ buttonText }}
                        </Button>
                        <Button type="button" variant="outline" class="w-full md:w-auto" @click="goBack">
                            Cancel
                        </Button>
                    </div>
                    <p v-if="!isEmailVerified" class="mt-6 text-sm text-muted-foreground">A link will be sent to your email to confirm ownership. Click it to verify your email.</p>
                </form>
            </div>
            <div v-else class="text-left">
                <p class="text-muted-foreground">Channel not found or you don't have permission to edit it.</p>
                <Button variant="outline" class="mt-4" @click="goBack">
                    Go back
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    Inbox,
    Loader2,
    Save
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader } from '@/components/ui/card'
import { ref, h, watch, inject, onMounted } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { emailChannelsService } from '@/api/services/email-channels.service'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const channelId = ref(null)
const channel = ref(null)
const showOptionalFields = ref(false)
const frequencyValue = ref([0])
const emailTo = ref('')
const emailCc = ref('')
const emailSubject = ref('')
const { toast } = useToast()
const isLoading = ref(true)
const isSubmitting = ref(false)
const setSettingsLoading = inject('setSettingsLoading', null)
const existingChannels = ref([])
const isEmailVerified = ref(false)
const buttonText = ref('Save changes and verify')

// Watch frequency value changes
watch(frequencyValue, (newVal) => {
    // Make sure we're setting the correct value from the array
    const value = newVal[0];
    setFieldValue('email-frequency', value);
})

const formSchema = toTypedSchema(z.object({
    'email-to': z.string().email(),
    'email-cc': z.string().optional().refine(
        (val) => {
            if (!val) return true;
            return val.split(',').every(email => z.string().email().safeParse(email.trim()).success);
        },
        'Invalid CC field'
    ),
    'email-subject': z.string().optional(),
    'email-frequency': z.number().min(0).max(2)
}))

const { handleSubmit, setFieldValue, errors } = useForm({
    initialValues: {
        'email-to': '',
        'email-cc': '',
        'email-subject': '',
        'email-frequency': 0
    },
    validationSchema: formSchema,
    validateOnChange: false,
    validateOnBlur: false
})

const mapFrequencyToLevel = (value) => {
    const levels = ['weekly', 'daily', 'fire_hose'];
    return levels[value];
};

const mapLevelToFrequency = (level) => {
    const levels = ['weekly', 'daily', 'fire_hose'];
    return levels.indexOf(level);
};

const goBack = () => {
    router.push('/settings/channels');
};

onMounted(async () => {
    if (setSettingsLoading) setSettingsLoading(true);
    isLoading.value = true;
    try {
        existingChannels.value = await emailChannelsService.getAll();
    } catch (error) {
    }
    try {
        // Get channel ID from query params
        const emailParam = route.query.email;
        if (!emailParam) {
            throw new Error('No channel ID provided');
        }
        
        channelId.value = Number(emailParam);
        
        // Fetch channel data
        const channelData = await emailChannelsService.getById(channelId.value);
        channel.value = channelData;
        
        // Set form values
        emailTo.value = channelData.email_to;
        setFieldValue('email-to', channelData.email_to.trim().toLowerCase());
        
        // Set frequency value
        const frequencyIndex = mapLevelToFrequency(channelData.frequency_level);
        frequencyValue.value = [frequencyIndex];
        // Ensure the form value is set correctly
        setFieldValue('email-frequency', frequencyIndex);
        
        // Set optional fields if they exist
        if (channelData.email_cc) {
            emailCc.value = channelData.email_cc;
            setFieldValue('email-cc', channelData.email_cc);
            showOptionalFields.value = true;
        }
        
        if (channelData.custom_subject) {
            emailSubject.value = channelData.custom_subject;
            setFieldValue('email-subject', channelData.custom_subject);
            showOptionalFields.value = true;
        }
    } catch (error) {
        console.error('Error fetching channel:', error);
        toast({
            title: 'Error',
            description: 'Failed to load channel',
            variant: 'destructive'
        });
        channel.value = null;
    } finally {
        isLoading.value = false;
        if (setSettingsLoading) setSettingsLoading(false);
    }
});

// Watch emailTo input to check if it's already verified
watch(emailTo, (newEmail) => {
    if (newEmail && existingChannels.value && existingChannels.value.length > 0) {
        // Normalize the input email by trimming and converting to lowercase
        const normalizedNewEmail = newEmail.trim().toLowerCase();
        console.log(authStore.session?.user.email);
        // Check if email matches authenticated user's email or exists in verified channels
        const isAuthUserEmail = authStore.session?.user?.email?.toLowerCase() === normalizedNewEmail;
        const existingChannel = existingChannels.value.find(
            channel => channel.email_to && 
            channel.email_to.trim().toLowerCase() === normalizedNewEmail && 
            channel.verified
        );
        
        isEmailVerified.value = isAuthUserEmail || !!existingChannel;
        buttonText.value = isEmailVerified.value ? 'Save changes' : 'Save changes and verify';
    } else {
        isEmailVerified.value = false;
        buttonText.value = 'Save changes and verify';
    }
});


const onSubmit = handleSubmit(async (values) => {

    if (!channelId.value) return;
    
    try {
        isSubmitting.value = true;
        if (setSettingsLoading) setSettingsLoading(true);
        
        // Get the current frequency value directly from the slider
        const currentFrequency = frequencyValue.value[0];
        
        // Prepare payload for update
        const payload = {
            email_to: values['email-to'].trim().toLowerCase(),
            email_cc: values['email-cc'] || undefined,
            custom_subject: values['email-subject'] || undefined,
            frequency_level: mapFrequencyToLevel(currentFrequency)
        };
                
        // Update channel
        await emailChannelsService.update(channelId.value, payload);
        
        // Show success toast
        toast({
            title: 'Channel updated',
            description: 'Your email channel has been successfully updated.',
        });
        
        // Redirect back to channels page
        setTimeout(() => {
            router.push('/settings/channels');
        }, 1500);
    } catch (error) {
        console.error('Error updating email channel:', error);
        toast({
            title: 'Error',
            description: 'Failed to update email channel. Please try again.',
            variant: 'destructive'
        });
    } finally {
        isSubmitting.value = false;
        if (setSettingsLoading) setSettingsLoading(false);
    }
}, (errors) => {
    toast({
        title: 'Some fields in error',
        description: 'Please review your form and submit again.',
        action: h(ToastAction, {
          altText: 'Try again',
        }, {
          default: () => 'Try again',
        }),
        variant: 'destructive'
    });
});
</script>
