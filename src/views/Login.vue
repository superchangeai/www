<template>
    <Header 
    :show-filter-button="false" 
    :show-help-button="true"
    :is-loading="currentStatus.isLoading"
  >
  </Header>
  <div class="flex items-center justify-center p-4 min-h-screen bg-background relative">
    <!-- Background SVG -->
    <div class="absolute inset-0 z-0 bg-curves" :style="{ backgroundImage: `url(${backgroundSvg})` }"></div>
    <!-- Login Card (on top of the background) -->
    <Card class="w-full max-w-md login-card relative h-screen shadow-xl">
      <CardHeader>
        <CardTitle class="text-xl text-left">Sign in</CardTitle>
        <CardDescription class="text-left">
          Members can search history and create custom alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p v-if="$route.query.error" class="mb-4 text-sm text-destructive text-left">
          Authentication failed. Please try again.
        </p>
        
        <Button class="w-full mb-5" @click="signInWithGithub">
          <Github class="mr-2 h-4 w-4" />
          Connect with GitHub
        </Button>
        <div class="relative my-2">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Form @submit="login" class="space-y-4 text-left">
          <FormField name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input v-model="email" type="email" placeholder="name@example.com" required />
              </FormControl>
            </FormItem>
          </FormField>
          <FormField name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input v-model="password" type="password" placeholder="••••••••" required />
              </FormControl>
            </FormItem>
          </FormField>
          
          <!-- Turnstile Captcha -->
          <div
          ref="turnstileContainer"
          :class="['flex', 'justify-center', 'my-4', 'turnstile-container']"
          ></div>          
          <Button type="submit" variant="outline" class="w-full" :disabled="isLoading">
            <SquareUser class="mr-2 h-4 w-4" /> Sign in with email
          </Button>
          <div class="text-center text-sm text-muted-foreground">
            <a href="/forgot-password">Forgot your password?</a>
          </div>
          <div class="text-center text-sm text-muted-foreground">
            <a href="/signup">Don't have an account? Sign up</a>
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Github, SquareUser } from 'lucide-vue-next'
import { useColorMode } from '@vueuse/core'
import Header from '@/components/Header.vue'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const turnstileToken = ref('')
const turnstileContainer = ref<HTMLDivElement | null>(null)

// Theme toggle
const mode = useColorMode()

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
      theme: mode.value, // Set theme based on color mode
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

// Watch for color mode changes
watch(mode, () => {
  // Update turnstile widget
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId) // Remove the existing widget
  }
  renderTurnstile() // Render a new widget with the updated theme
  
})

// Clean up the widget 
onUnmounted(() => {
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId)
  }
})

async function login() {
  try {
    if (!turnstileToken.value) {
      alert('Please complete the captcha verification')
      return
    }

    isLoading.value = true
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
      options: {
        captchaToken: turnstileToken.value
      }
    })
    
    if (error) {
      throw error
    } else {
      const redirect = route.query.redirect?.toString() || '/'
      router.push(redirect)
    }
  } catch (error: any) {
    alert('Login failed: ' + error.message)
  } finally {
    isLoading.value = false
    if (window.turnstile && turnstileContainer.value) {
      window.turnstile.reset()
    }
  }
}

async function signInWithGithub() {
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
    alert('GitHub login failed: ' + error.message)
    isLoading.value = false
  }
}

// Update Turnstile type definition
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void; // Assuming remove exists
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
  /* height: 65px; */
}

.bg-curves {
  background-repeat: repeat;
  background-position: center;
  background-position-y: -50px;
  background-size: 100% 100%;
  opacity: 0.2;
}
</style>