<script setup lang="ts">
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { supabase } from '../lib/supabase'
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title?: string
  description?: string
  redirectPath?: string
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'success': []
}>()

import {
  Github,
  SquareUser
} from 'lucide-vue-next'

const isLoading = ref(false)

async function signInWithGithub() {
  try {
    isLoading.value = true
    
    // Store the redirect path in localStorage so we can access it after OAuth callback
    if (props.redirectPath) {
      localStorage.setItem('auth_redirect', props.redirectPath)
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      throw error
    }
  } catch (error: any) {
    alert('GitHub login failed: ' + error.message)
    isLoading.value = false
  }
}
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value) => emit('update:isOpen', value)">
    <DrawerContent>
      <div class="mx-auto mx-w-sm">
      <DrawerHeader>
        <DrawerTitle>{{ title || 'Sign in to continue' }}</DrawerTitle>
        <DrawerDescription>
          {{ description || `Authentication required to access this feature` }}
        </DrawerDescription>
      </DrawerHeader>
      <DrawerFooter>
        <div class="flex gap-2">
          <Button variant="outline" @click="signInWithGithub">
              <Github class="mr-2 h-12 w-12 text-bold" />
              Connect with Github
          </Button>
          <RouterLink to="/login">
            <Button variant="outline">
              <SquareUser class="mr-2 h-12 w-12 text-bold" />
              Sign in with email
            </Button>
          </RouterLink>
        </div>
        <hr>
        <p class="text-sm text-center text-muted-foreground py-2">Don't have an account yet?</p>
        <RouterLink to="/signup" class="w-full">
          <Button class="w-full">
              Sign up (free)
          </Button>
        </RouterLink>
        <Button variant="ghost" @click="() => emit('update:isOpen', false)">
          Cancel
        </Button>
      </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>