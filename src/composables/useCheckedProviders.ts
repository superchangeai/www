import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Create a singleton instance to share state across components
const checkedProviders = ref<string[]>([])

export function useCheckedProviders() {
  const router = useRouter()
  
  // Function to reset checked providers
  const resetCheckedProviders = () => {
    checkedProviders.value = []
  }
  
  // Function to toggle a provider's checked state
  const updateCheckedProviders = (providerValue: string, checked: boolean) => {
    if (checked) {
      // Add provider to checked list if not already present
      if (!checkedProviders.value.includes(providerValue)) {
        checkedProviders.value = [...checkedProviders.value, providerValue]
      }
    } else {
      // Remove provider from checked list
      checkedProviders.value = checkedProviders.value.filter(id => id !== providerValue)
    }
  }

  const checkedProvidersCount = computed(() => checkedProviders.value.length)
  const checkedProvidersParams = computed(() => {
    if (checkedProviders.value.length === 0) return ''
    return '?' + checkedProviders.value
      .map(provider => `providers=${encodeURIComponent(provider)}`)
      .join('&')
  })
  
  // Set up route change listener
  onMounted(() => {
    // Reset checked providers when route changes
    router.beforeEach((to, from) => {
      if (to.path !== from.path) {
        resetCheckedProviders()
      }
      return true
    })
  })
  
  // Clean up the router guard when component is unmounted
  onUnmounted(() => {
    // The router guard will be automatically removed when the component is unmounted
  })

  return {
    checkedProviders,
    checkedProvidersCount,
    checkedProvidersParams,
    updateCheckedProviders,
    resetCheckedProviders
  }
}