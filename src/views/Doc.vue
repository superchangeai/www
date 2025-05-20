<template>
  <div class="doc-page">
    <DocContent :docPath="docPath" @update-toc="$emit('update-toc', $event)" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DocContent from '@/components/DocContent.vue';

const route = useRoute();

// Accept slug as a prop if provided
const props = defineProps({
  slug: {
    type: String,
    required: false
  }
});

// Compute the document path based on prop or route parameters
const docPath = computed(() => {
  const slug = props.slug || route.params.slug;
  // For how-to guides
  if (route.name === 'doc-how-to') {
    return `how-to-${slug}`;
  }
  // For static docs like faq, contribute, feature-requests
  const staticDocs = ['faq', 'contribute', 'feature-requests'];
  if (staticDocs.includes(slug)) {
    return slug;
  }
  // For getting started docs
  return slug || 'introduction';
});

// Log the current path for debugging
console.log('Current doc path:', docPath.value);

// Define emits to forward table of contents to parent
defineEmits(['update-toc']);
</script>