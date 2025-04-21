<script setup>
import { Moon, SunMedium, AppWindowMac } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useColorMode } from '@vueuse/core'

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode()
</script>
<template>
    <div class="px-4 md:px-8 py-2 text-left space-y-6">
        <Card>
            <CardHeader>
                <CardTitle class="text-left">Customize your Superchange theme</CardTitle>
            </CardHeader>
            <CardContent class="flex items-center gap-2">
                
                <RadioGroup default-value="system">
                    <div class="flex items-center space-x-2">
                        <RadioGroupItem id="light" value="light" @click="mode = 'light'" />
                        <Label for="light" class="flex gap-2 items-center"><SunMedium class="h-5 w-5" /> Light theme</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                        <RadioGroupItem id="dark" value="dark" @click="mode = 'dark'" />
                        <Label for="dark" class="flex gap-2 items-center"><Moon class="h-5 w-5" /> Dark theme</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                        <RadioGroupItem id="system" value="system" @click="mode = 'auto'" />
                        <Label for="system" class="flex gap-2 items-center"><AppWindowMac class="h-5 w-5" /> System (auto)</Label>
                    </div>
                </RadioGroup>
                
            </CardContent>
        </Card>
    </div>
</template>