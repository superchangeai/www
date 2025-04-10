<template>
    <div class="py-2 px-4 md:px-8">
        <RadioGroup v-model="selectedChannel" class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
            <div v-for="channel in channels" :key="channel.value" class="relative">
                <Card :class="[selectedChannel === channel.value ? 'border-primary bg-primary/5' : 'hover:bg-accent', channel.disabled ? 'opacity-50 bg-muted cursor-not-allowed' : '', 'transition-colors']">
                    <CardHeader class="flex flex-col space-y-4 text-sm">
                        <div class="flex flex-row justify-between items-center gap-4">
                            <div class="flex items-center gap-2">
                                <component :is="channel.icon" class="mr-2 h-4 w-4 flex-none md:inline sm:hidden" />
                                <div class="flex-auto flex-col space-y-1.5 text-md font-semibold">
                                    {{ channel.label }}
                                </div>
                            </div>
                            <RadioGroupItem :value="channel.value" :disabled="channel.disabled" :class="{'cursor-not-allowed': channel.disabled, 'cursor-pointer': !channel.disabled}" />
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </RadioGroup>
        <div class="mt-6 text-left">
            <div v-if="selectedChannel === 'email'">
                <!-- Email configuration content -->
                
                <form class="pb-10" @submit="onSubmit">
                    <FormField name="email-to">
                        <FormItem>
                            <FormLabel class="text-md"><h2 class="py-2">1. Shoot an email to:</h2></FormLabel>              
                            <FormControl>
                                <Input placeholder="inbox@" v-model="emailTo" @change="setFieldValue('email-to', emailTo)"></Input>
                            </FormControl>
                            <!-- <FormDescription>
                                Description here
                            </FormDescription> -->
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
                                    <Input placeholder="copy@, copy@" v-model="emailCc" @change="setFieldValue('email-cc', emailCc)"></Input>
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
                                    <Input placeholder="Custom subject field" v-model="emailSubject" @change="setFieldValue('email-subject', emailSubject)"></Input>
                                </FormControl>
                                <!-- <FormDescription>
                                    Description here
                                </FormDescription> -->
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>
                    <FormField name="email-frequency">
                        <FormItem>
                            <FormLabel class="text-md"><h2 class="py-2 mt-6">2. Frequency level:</h2></FormLabel>              
                            <FormControl>
                                <div class="space-y-4">
                                    <Slider 
                                        v-model="frequencyValue" 
                                        :min="0" 
                                        :max="2" 
                                        :step="1" 
                                        class="w-full"
                                        @update:modelValue="handleFrequencyChange" 
                                    />
                                    <div class="flex justify-between text-sm text-muted-foreground">
                                        <span :class="{ 'text-primary font-medium': frequencyValue[0] === 0 }" class="cursor-pointer" @click="handleFrequencyClick(0)">
                                            <HoverCard>
                                                <HoverCardTrigger>Weekly digest</HoverCardTrigger>
                                                <HoverCardContent>
                                                    Start each week with your Superchange wrap up!
                                                </HoverCardContent>
                                            </HoverCard>
                                        </span>
                                        <span :class="{ 'text-primary font-medium': frequencyValue[0] === 1 }" class="cursor-pointer" style="position: relative; left:-10px;" @click="handleFrequencyClick(1)">
                                            <HoverCard>
                                                <HoverCardTrigger>Daily push</HoverCardTrigger>
                                                <HoverCardContent>
                                                    Fresh updates delivered daily, like your morning coffee! ☕
                                                </HoverCardContent>
                                            </HoverCard>
                                        </span>
                                        <span :class="{ 'text-primary font-medium': frequencyValue[0] === 2 }" class="cursor-pointer" @click="handleFrequencyClick(2)">
                                            <HoverCard>
                                                <HoverCardTrigger>Fire hose</HoverCardTrigger>
                                                <HoverCardContent>
                                                    Brace yourself. Any new update get pushed your way right away!
                                                </HoverCardContent>
                                            </HoverCard>
                                        </span>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <!-- Submit button -->
                    <div class="mt-8 flex justify-start">
                        <Button type="submit" class="w-full md:w-auto">
                            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                            <Inbox v-else />
                            {{ buttonText }}
                        </Button>
                    </div>
                    <p v-if="!isEmailVerified" class="mt-6 text-sm text-muted-foreground">A link will be sent to your email to confirm ownership. Click it to verify your email.</p>

                    
                </form>
                
            </div>
            <div v-else-if="selectedChannel === 'slack'">
                <!-- Slack configuration content -->
                <h3 class="text-lg font-medium">Slack configuration (soon)</h3>
            </div>
            <div v-else-if="selectedChannel === 'webhook'">
                <!-- Webhook configuration content -->
                <h3 class="text-lg font-medium">Webhook configuration (soon)</h3>
            </div>
        </div>
    </div>
</template>
<script setup>
import {
    Inbox,
    Webhook,
    Slack,
    Loader2
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader } from '@/components/ui/card'
import { ref, h, watch, inject, onMounted } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { emailChannelsService } from '@/api/services/email-channels.service'

const selectedChannel = ref('email')
const showOptionalFields = ref(false)
const frequencyValue = ref([0])
const emailTo = ref('')
const emailCc = ref('')
const emailSubject = ref('')
const { toast } = useToast()
const isLoading = ref(false)
const setSettingsLoading = inject('setSettingsLoading', null)
const existingChannels = ref([])
const isEmailVerified = ref(false)
const buttonText = ref('Add and verify this email address')

const channels = [
{ value: 'email', label: 'Email', icon: Inbox, disabled: false },
{ value: 'slack', label: 'Slack', icon: Slack, disabled: true },
{ value: 'webhook', label: 'Webhook', icon: Webhook, disabled: true }
]

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

const handleFrequencyChange = (newValue) => {
    setFieldValue('email-frequency', newValue[0]);
}

const handleFrequencyClick = (value) => {
    frequencyValue.value = [value];
    setFieldValue('email-frequency', value);
}

// Watch frequency value changes (this is a backup, the direct handlers above should handle most cases)
watch(frequencyValue, (newVal) => {
    setFieldValue('email-frequency', newVal[0]);
}, { deep: true });

// Set initial frequency value
setFieldValue('email-frequency', frequencyValue.value[0])

// Fetch all email channels when component is mounted
onMounted(async () => {
    try {
        existingChannels.value = await emailChannelsService.getAll();
        console.log(existingChannels.value);
    } catch (error) {
        console.error('Error fetching email channels:', error);
    }
});

// Watch emailTo input to check if it's already verified
watch(emailTo, (newEmail) => {
    if (newEmail && existingChannels.value && existingChannels.value.length > 0) {
        // Normalize the input email by trimming and converting to lowercase
        const normalizedNewEmail = newEmail.trim().toLowerCase();
        
        const existingChannel = existingChannels.value.find(
            channel => channel.email_to && 
            channel.email_to.trim().toLowerCase() === normalizedNewEmail && 
            channel.verified
        );
        console.log(existingChannel);
        
        isEmailVerified.value = !!existingChannel;
        buttonText.value = isEmailVerified.value ? 'Use this email address' : 'Add and verify this email address';
    } else {
        isEmailVerified.value = false;
        buttonText.value = 'Add and verify this email address';
    }
});

const mapFrequencyToLevel = (value) => {
    const levels = ['weekly', 'daily', 'fire_hose'];
    return levels[value];
};

const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
        isLoading.value = true
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(true)
        // Send request to create email channel
        const payload = {
            email_to: values['email-to'],
            email_cc: values['email-cc'] || undefined,
            custom_subject: values['email-subject'] || undefined,
            frequency_level: mapFrequencyToLevel(values['email-frequency']),
            skip_verification: isEmailVerified.value
        };
        
        await emailChannelsService.create(payload);

        // Show success toast
        toast({
            title: 'Channel created',
            description: isEmailVerified.value 
                ? 'Your existing verified email has been used for this channel.' 
                : 'A link was sent to verify your email.',
        });

        // Reset form and redirect after 3 seconds
        resetForm();
        setTimeout(() => {
            window.location.href = '/settings/channels';
        }, 3000);
    } catch (error) {
        console.error('Error creating email channel:', error);
        toast({
            title: 'Error',
            description: 'Failed to create email channel. Please try again.',
            variant: 'destructive'
        });
    } finally {
        isLoading.value = false
        // Update parent loading state
        if (setSettingsLoading) setSettingsLoading(false)
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
    })
})
</script>