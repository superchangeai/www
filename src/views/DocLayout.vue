<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-background">
    <!-- Mobile doc menu button -->
    <div class="md:hidden sticky top-0 z-50 w-full bg-background border-b border-border p-4">
      <Button variant="outline" class="w-full flex justify-between items-center" @click="toggleSidebar">
        <div class="flex items-center gap-2">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6" />
            <span class="font-semibold">superchange.ai</span>
            <Badge variant="outline">docs</Badge>
        </div>
        <ChevronDown :class="{ 'transform rotate-180': showMobileSidebar }" class="h-4 w-4 transition-transform" />
      </Button>
      
      <!-- Mobile sidebar -->
      <div v-if="showMobileSidebar" class="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 min-h-screen">
        <DocSidebar @navigate="toggleSidebar" />
      </div>
    </div>
    
    <!-- Desktop sidebar -->
    <div class="hidden md:block w-64 border-r border-border bg-muted/30 sticky top-0 h-screen overflow-y-auto">
        <div class="flex items-center justify-between border-b border-border p-6">
          <router-link to="/docs" class="flex items-center gap-2">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6" />
            <span class="font-semibold">superchange.ai</span>
            <Badge variant="outline">docs</Badge>
          </router-link>
        </div>
      <DocSidebar />
    </div>
    
    <!-- Main content area -->
    <div class="flex-1 overflow-auto">
      <div class="flex flex-col md:flex-row gap-8 p-6 md:p-8">
        <!-- Main content (2/3) -->
        <div class="w-full lg:w-2/3 text-left">
          <router-view @update-toc="updateTableOfContents"></router-view>
          <hr class="my-8" />
          <a class="text-sm text-muted-foreground flex gap-2 items-center" href="https://github.com/superchangeai/www/tree/main/src/docs">Edit this page on Github <ExternalLink class="w-4 inline"/></a>
        </div>
        
        <!-- On This Page sidebar (1/3) - Only visible on desktop -->
        <div class="hidden lg:block w-full lg:w-1/3 text-left">
          <div class="sticky top-8 space-y-6" v-if="tableOfContents.length > 0">
            <h3 class="font-semibold">On this page</h3>
            <nav>
              <ul class="text-sm">
                <li v-for="(item, index) in tableOfContents" :key="index">
                  <a 
                    :href="`#${item.id}`" 
                    class="hover:text-primary block py-1"
                    :class="{ 'pl-2': item.level === 3, 'pl-4': item.level > 3 }"
                  >
                    {{ item.text }}
                  </a>
                </li>
              </ul>
            </nav>
            <h3 class="font-semibold">Is this helpful?</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '@vueuse/core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
useColorMode()
import { ChevronDown, ExternalLink } from 'lucide-vue-next';
import DocSidebar from '@/components/DocSidebar.vue';

const showMobileSidebar = ref(false);
// Define interface for table of contents items
interface TocItem {
  id: string;
  text: string;
  level: number;
}

const tableOfContents = ref<TocItem[]>([]);

const toggleSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value;
};

const updateTableOfContents = (toc: TocItem[]) => {
  tableOfContents.value = toc;
};
</script>