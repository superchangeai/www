<template>
  <div class="w-full min-h-full h-full">
    <Header 
      :title="'Settings'"
      :icon="Settings"
      :show-filter-button="false" 
      :show-help-button="true"
      :is-loading="isLoading"
    >
    </Header>
    <div class="flex h-full min-h-full">
      <LeftNav class="h-full min-h-full flex-0" />
      <router-view class="flex-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LeftNav from '@/components/settingsNav.vue'
import Header from '@/components/Header.vue'
import {
  Settings,
} from 'lucide-vue-next'
import { ref, provide } from 'vue'

// Create a loading state that will be shared with child components
const isLoading = ref(false)

// Provide the loading state and a setter function to child components
provide('settingsLoading', isLoading)
provide('setSettingsLoading', (value: boolean) => {
  isLoading.value = value
})
</script>