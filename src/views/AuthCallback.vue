<template>
  <Header 
      :title="'Redirection'"
      :icon="Github"
      :show-filter-button="false" 
      :show-help-button="false"
    >
    </Header> 
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">Authenticating...</CardTitle>
        <CardDescription class="text-center">
          Please wait while we complete your authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex justify-center py-4">
          <Loader2 class="h-8 w-8 animate-spin" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Github } from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import { userOnboardingService } from '@/api/services/user-onboarding.service'

const router = useRouter()

onMounted(async () => {
  try {
    // Exchange the code for a session
    const { error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    // Check if this is a new signup (not a login)
    const isNewSignup = localStorage.getItem('is_new_signup')
    
    if (isNewSignup === 'true') {
      // Create a default email channel for new users
      try {
        await userOnboardingService.createDefaultEmailChannel()
      } catch (err) {
        console.error('Error creating default email channel:', err)
        // Continue with auth flow even if email channel creation fails
      }
      
      // Clear the signup flag
      localStorage.removeItem('is_new_signup')
    }
    
    // Check if we have a stored redirect path
    const redirectPath = localStorage.getItem('auth_redirect')
    
    // Clear the stored redirect path
    localStorage.removeItem('auth_redirect')
    
    // Redirect to the original requested URL or home if none
    if (redirectPath) {
      router.push(redirectPath)
    } else {
      router.push('/feed')
    }
  } catch (error: any) {
    console.error('Error in auth callback:', error.message)
    router.push('/login?error=callback')
  }
})
</script>