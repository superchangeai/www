<template>
  <div class="doc-content">
    <div v-if="content">
      <h1 v-if="content.title" class="text-2xl mb-2 text-left">{{ content.title }}</h1>
      <hr>
      <div v-html="processedContent" class="text-left prose prose-sm md:prose-base max-w-none dark:prose-invert mt-6"></div>
    </div>
    <div v-else-if="error" class="text-destructive">
      {{ error }}
    </div>
    <div v-else class="text-muted-foreground">
      Loading documentation...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { marked } from 'marked';
import yaml from 'js-yaml';

const props = defineProps({
  docPath: {
    type: String,
    required: true
  }
});

const content = ref(null);
const error = ref(null);
const tableOfContents = ref([]);

// Emit the table of contents to the parent component
const emit = defineEmits(['update-toc']);

// Computed property for processed content with heading IDs
const processedContent = computed(() => {
  if (!content.value || !content.value.content) return '';
  return content.value.content;
});

// Function to fetch and process the document
const fetchDoc = async (docPath) => {
  if (!docPath) return;
  
  error.value = null;
  content.value = null;
  
  try {
    // For how-to guides
    if (docPath.startsWith('how-to-')) {
      const modules = import.meta.glob('/src/docs/*.md', { as: 'raw' });
      const modulePath = `/src/docs/${docPath}.md`;

      if (modules[modulePath]) {
        const rawContent = await modules[modulePath]();
        processMarkdown(rawContent);
      } else {
        error.value = `Documentation not found: ${docPath}`;
      }
    } 
    // For getting started docs
    else {
        console.log('this is something else', docPath)
      const modules = import.meta.glob('/src/docs/getting-started/*.md', { as: 'raw' });
      const modulePath = `/src/docs/getting-started/${docPath}.md`;

      if (modules[modulePath]) {
        const rawContent = await modules[modulePath]();
        processMarkdown(rawContent);
      } else {
        error.value = `Documentation not found: ${docPath}`;
      }
    }
  } catch (error) {
    console.error('Error loading documentation:', error);
    error.value = 'Failed to load documentation';
  }
};

// Process markdown content with frontmatter
const processMarkdown = (rawContent) => {
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

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdownContent);
  
  // Extract table of contents and get HTML with IDs
  const { toc, htmlWithIds } = extractTableOfContents(htmlContent);
  tableOfContents.value = toc;
  
  // Emit the table of contents to the parent component
  emit('update-toc', toc);

  // Set the content
  content.value = {
    title: frontmatter.title || '',
    content: htmlWithIds
  };
};

// Watch for changes in docPath
watch(() => props.docPath, (newPath) => {
  fetchDoc(newPath);
});

// Initial fetch
onMounted(() => {
  fetchDoc(props.docPath);
});

// Function to extract headings and build table of contents
const extractTableOfContents = (htmlContent) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Select all h2 headings for the table of contents
  const headings = tempDiv.querySelectorAll('h2');
  const toc = [];
  
  headings.forEach((heading, index) => {
    // Create an ID for the heading if it doesn't have one
    const headingId = heading.id || `heading-${index}`;
    heading.id = headingId; // Set ID on the heading in our temp DOM
    
    // Get heading level (h2 = 2, h3 = 3, etc.)
    const level = parseInt(heading.tagName.substring(1));
    
    toc.push({
      id: headingId,
      text: heading.textContent,
      level: level
    });
  });
  
  // Return both the TOC data and the modified HTML with IDs
  return {
    toc,
    htmlWithIds: tempDiv.innerHTML
  };
};
</script>

<style scoped>
.doc-content :deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.doc-content :deep(h2) {
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.doc-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.doc-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.doc-content :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.doc-content :deep(p) {
  margin: 0.75rem 0;
  font-size: 0.9rem;
}

.doc-content :deep(li) {
  font-size: 0.9rem;
}

.doc-content :deep(code) {
  background-color: var(--muted);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.doc-content :deep(pre) {
  background-color: var(--muted);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.doc-content :deep(blockquote) {
  border-left: 4px solid var(--border);
  padding-left: 1rem;
  font-style: italic;
  margin: 1rem 0;
}
</style>