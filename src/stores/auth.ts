import { reactive } from 'vue'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
}

export const authStore = reactive<AuthState>({
  session: null
})

// Initialize session and listen for changes
supabase.auth.getSession().then(({ data: { session } }) => {
  authStore.session = session
})

supabase.auth.onAuthStateChange((_event, session) => {
  authStore.session = session
})