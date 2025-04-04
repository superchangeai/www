import { ref } from 'vue'

interface AuthDrawerOptions {
  title?: string
  description?: string
  feature?: string
  redirectPath?: string
  onSuccess?: () => void
}

export function useAuthDrawer() {
  const isOpen = ref(false)
  const options = ref<AuthDrawerOptions>({})

  const open = (drawerOptions: AuthDrawerOptions) => {
    options.value = drawerOptions
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    options.value = {}
  }

  return {
    isOpen,
    options,
    open,
    close
  }
}