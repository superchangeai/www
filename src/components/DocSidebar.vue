<template>
  <div class="doc-sidebar text-left p-6">
    <!-- Getting Started Section -->
    <div class="mb-6">
      <h3 class="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-[.10em]">Getting Started</h3>
      <ul class="space-y-1">
        <li>
          <router-link to="/docs/introduction" custom v-slot="{ navigate, isActive }">
            <Button
              variant="ghost"
              class="w-full justify-start text-sm font-normal"
              :class="{ 'bg-accent': isActive }"
              @click="() => { navigate(); $emit('navigate'); }"
            >
              Introduction
            </Button>
          </router-link>
        </li>
        <!-- <li>
          <a href="http://api.superchange.ai/docs" target="_blank">
            <Button
              variant="ghost"
              class="w-full justify-start text-sm font-normal"
              :class="{ 'bg-accent': isActive }"
              @click="() => { navigate(); $emit('navigate'); }"
            >
              API Reference
            </Button>
        </a>
        </li> -->
        <li>
          <router-link to="/docs/faq" custom v-slot="{ navigate, isActive }">
            <Button
              variant="ghost"
              class="w-full justify-start text-sm font-normal"
              :class="{ 'bg-accent': isActive }"
              @click="() => { navigate(); $emit('navigate'); }"
            >
              FAQ
            </Button>
          </router-link>
        </li>
        <li>
          <router-link to="/docs/contribute" custom v-slot="{ navigate, isActive }">
            <Button
              variant="ghost"
              class="w-full justify-start text-sm font-normal"
              :class="{ 'bg-accent': isActive }"
              @click="() => { navigate(); $emit('navigate'); }"
            >
              Contribute
            </Button>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- How To Section -->
    <div>
      <h3 class="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-[.10em]">How To</h3>
      <ul class="space-y-1">
        <li v-for="guide in howToGuides" :key="guide.path">
          <router-link :to="`/docs/how-to/${guide.path}`" custom v-slot="{ navigate, isActive }">
            <Button
              variant="ghost"
              class="w-full justify-start text-sm font-normal capitalize"
              :class="{ 'bg-accent': isActive }"
              @click="() => { navigate(); $emit('navigate'); }"
            >
              {{ guide.title.replace(/^"How to /i, '').replace(/"$/, '') }}
            </Button>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';

// Define emit for mobile navigation closing
defineEmits(['navigate']);

// Define interface for guide items
interface GuideItem {
  title: string;
  path: string;
}

// How-to guides loaded dynamically and sorted alphabetically
const howToGuides = ref<GuideItem[]>([]);

onMounted(async () => {
  // Get all how-to markdown files from the docs directory
  const modules = import.meta.glob('/src/docs/how-to-*.md', { as: 'raw' });
  
  const guides = await Promise.all(
    Object.keys(modules).map(async (path) => {
      // Extract the slug from the file path
      const slug = path.replace('/src/docs/', '').replace('.md', '');
      const pathSlug = slug.replace('how-to-', '');
      
      // Load the file content to extract the title from frontmatter if available
      const content = await modules[path]();
      
      // Try to extract title from frontmatter or generate from slug
      let title = '';
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const titleMatch = frontmatterMatch[1].match(/title:\s*(.*)/);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }
      
      // If no title found in frontmatter, generate from slug
      if (!title) {
        title = pathSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      return { title, path: pathSlug };
    })
  );
  
  // Sort guides alphabetically by title
  howToGuides.value = guides.sort((a, b) => a.title.localeCompare(b.title));
});

</script>
<style scoped>
:deep(li) {
  margin-bottom: 0;
  list-style:none;
}
:deep(ul) {
  margin: 0;
  padding: 0;
}
</style>