<template>
  <Header 
    :show-filter-button="false" 
    :show-help-button="false"
    :is-loading="currentStatus.isLoading"
  >
  </Header>
  <div class="flex items-center justify-center p-4 min-h-screen bg-background relative">
    <!-- Background SVG -->
    <div class="absolute inset-0 z-0 bg-curves" :style="{ backgroundImage: `url(${backgroundSvg})` }"></div>
    <Card class="w-full max-w-md login-card relative h-screen shadow-xl">
      <CardHeader>
        <CardTitle class="text-2xl text-left">Sign up (free)</CardTitle>
        <CardDescription class="text-left">
          Create an account to search history and create custom alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p v-if="$route.query.error" class="mb-4 text-sm text-destructive text-left">
          Registration failed. Please try again.
        </p>
        
        <Button class="w-full mb-5" @click="signUpWithGithub" variant="outline">
          <Github class="mr-2 h-4 w-4" />
          Use your GitHub account
        </Button>
        <div class="relative my-2">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Form @submit="signUp" class="space-y-4 text-left">
          <FormField name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input v-model="email" type="email" placeholder="alan@turing.com" required />
              </FormControl>
            </FormItem>
          </FormField>
          <FormField name="password">
            <FormItem>
              <FormLabel>Password (at least 8 characters)</FormLabel>
              <FormControl>
                <Input v-model="password" type="password" placeholder="••••••••" required />
              </FormControl>
              
            </FormItem>
          </FormField>
          <FormField name="confirmPassword">
            <FormItem>
              <FormLabel>Repeat password</FormLabel>
              <FormControl>
                <Input v-model="confirmPassword" type="password" placeholder="••••••••" required />
              </FormControl>
            </FormItem>
          </FormField>
          
          <!-- Turnstile Captcha -->
          <div
            ref="turnstileContainer"
            :class="['flex', 'justify-center', 'my-4', 'turnstile-container']"
          ></div>          
          <Button type="submit" class="w-full" :disabled="isLoading">
            <SquareUser class="mr-2 h-4 w-4" /> Create account
          </Button>
          <div class="text-center text-sm text-muted-foreground">
            <a href="/login">Already have an account? Sign in</a>
          </div>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form'
import { Github, SquareUser } from 'lucide-vue-next'
import { useColorMode } from '@vueuse/core'
import Header from '@/components/Header.vue'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const turnstileToken = ref('')
const turnstileContainer = ref<HTMLDivElement | null>(null)

// Theme toggle
const mode = useColorMode()

// Password validation
const isPasswordValid = computed(() => {
  return password.value.length >= 8 && password.value === confirmPassword.value
})

// Store the widget ID to manage the Turnstile instance
let widgetId: string | null = null

// Function to render the Turnstile widget with the current theme
const renderTurnstile = () => {
  if (window.turnstile && turnstileContainer.value) {
    widgetId = window.turnstile.render(turnstileContainer.value, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      callback: (token: string) => {
        turnstileToken.value = token
      },
      appearance: 'always',
      theme: mode.value,
      retry: 'auto',
      'refresh-expired': 'auto',
      'error-callback': () => {
        turnstileToken.value = ''
      }
    })
  }
}

// Initial render when component mounts
onMounted(() => {
  renderTurnstile()
})

// Watch for color mode changes and re-render the widget
watch(mode, () => {
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId)
  }
  renderTurnstile()
})

// Clean up the widget when the component is unmounted
onUnmounted(() => {
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId)
  }
})

async function signUp() {
  try {
    if (!turnstileToken.value) {
      alert('Please complete the captcha verification')
      return
    }

    if (!isPasswordValid.value) {
      alert('Please ensure your passwords match and are at least 8 characters long')
      return
    }

    isLoading.value = true
    
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        captchaToken: turnstileToken.value,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      throw error
    } else {
      alert('Please check your email for the confirmation link')
      router.push('/login')
    }
  } catch (error: any) {
    alert('Sign up failed: ' + error.message)
  } finally {
    isLoading.value = false
    if (window.turnstile && turnstileContainer.value) {
      window.turnstile.reset()
    }
  }
}

async function signUpWithGithub() {
  try {
    isLoading.value = true
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          captchaToken: turnstileToken.value
        }
      }
    })
    
    if (error) {
      throw error
    }
  } catch (error: any) {
    alert('GitHub sign up failed: ' + error.message)
    isLoading.value = false
  }
}

// Update Turnstile type definition
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// config the header title and icon
const currentStatus = computed(() => ({
  isLoading: isLoading.value
}))

const backgroundSvg = computed(() => mode.value === 'dark' ? '/durves-white.svg' : '/durves-black.svg')

</script>

<style>
.turnstile-container {
  width: 300px;
}
.bg-curves {
  background-repeat: repeat;
  background-position: center;
  background-position-y: -100px;
  background-size: 100% 100%;
  opacity: 0.2;
  transform: rotate(180deg)
}
</style>