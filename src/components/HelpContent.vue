<template>
  <div class="help-content">
    <div v-if="helpContent">
      <h1 v-if="helpContent.title" class="text-xl font-bold mb-2">{{ helpContent.title }}</h1>
      <div v-html="helpContent.content" class="text-sm help-markdown-content"></div>
    </div>
    <div v-else-if="error" class="text-destructive">
      {{ error }}
    </div>
    <div v-else class="text-muted-foreground">
      Loading help content...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { marked } from 'marked';
import yaml from 'js-yaml';

const props = defineProps({
  docPath: {
    type: String,
    required: true
  }
});

const helpContent = ref(null);
const error = ref(null);

// Function to fetch and process the help document
const fetchHelpDoc = async (docPath) => {
  if (!docPath) return;
  
  error.value = null;
  helpContent.value = null;
  
  try {
    const modules = import.meta.glob('/src/docs/*.md', { as: 'raw' });
    const modulePath = `/src/docs/${docPath}.md`;

    if (modules[modulePath]) {
      const rawContent = await modules[modulePath]();

      // Parse frontmatter
      const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
      const match = rawContent.match(frontmatterRegex);

      let frontmatter = {};
      let markdownContent = rawContent;

      if (match && match[1]) {
        try {
          frontmatter = yaml.load(match[1]);
          markdownContent = rawContent.substring(match[0].length).trim();
        } catch (e) {
          console.error('Error parsing frontmatter:', e);
        }
      }

      // Render Markdown using marked
      const htmlContent = marked(markdownContent);
      
      helpContent.value = {
        title: frontmatter.title || 'Help',
        description: frontmatter.description || '',
        content: htmlContent
      };
    } else {
      throw new Error(`Help document not found at path: ${modulePath}`);
    }
  } catch (e) {
    console.error('Failed to fetch or process help document:', e);
    error.value = 'Failed to load help content.';
  }
};

// Fetch help document when the component is mounted
onMounted(() => {
  fetchHelpDoc(props.docPath);
});

// Watch for changes in the docPath prop and refetch if it changes
watch(() => props.docPath, (newDocPath) => {
  fetchHelpDoc(newDocPath);
});
</script>

<style scoped>
/* Deep selector needed to style elements inside v-html */
:deep(h1) {
  font-size: 1.2em;
  margin-bottom: 0.75rem;
  font-weight: 700;
}
:deep(h2) {
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
:deep(h3) {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: hsl(var(--primary));
}

:deep(p) {
  margin-bottom: 0.75rem;
}

:deep(ul) {
  list-style-type: disc;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

:deep(ol) {
  list-style-type: decimal;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

:deep(li) {
  margin-bottom: 0.25rem;
}

:deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

:deep(blockquote) {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
  border-left: 3px solid hsl(var(--primary));
}
</style>