<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">
    <header class="py-6 border-b border-border">
      <BlogHeader />
    </header>
    <main class="flex-grow">
      <div class="container mx-auto px-8 py-8 text-left">
        <!-- Breadcrumb -->
        <Breadcrumb class="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/blog">
                Blog
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{{ post ? post.title : 'Post' }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <!-- 2/3 - 1/3 Layout -->
        <div class="flex flex-col md:flex-row gap-8 relative overflow-none">
          <!-- Left column (2/3) - Blog content -->
          <div class="content w-full md:w-2/3">
            <h1 v-if="post">{{ post.title }}</h1>
            <div v-if="post" class="text-sm text-muted-foreground mb-4">
              <span v-if="post.author">By {{ post.author }}</span>
              <span v-if="post.author && formattedDate"> | </span>
              <span v-if="formattedDate">{{ formattedDate }}</span>
            </div>
            <div v-if="post" v-html="post.content"></div>
            <div v-else>Loading post...</div>
          </div>
          
          <!-- Right column (1/3) - Sidebar -->
          <div class="w-full md:w-1/3 relative">
            <div class="space-y-6 md:sticky md:top-8">
              <!-- Tags section -->
              <div v-if="post && post.tags && post.tags.length > 0" class="p-4 border border-border rounded-md">
                <h3 class="text-lg font-semibold mb-2">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(tag, index) in post.tags" 
                    :key="index"
                    class="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <!-- Share section -->
              <div class="p-4 border border-border rounded-md">
                <h3 class="text-lg font-semibold mb-2">Share</h3>
                <div class="flex gap-3">
                  <button class="p-2 hover:text-primary" title="Share on X">
                    <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path :d="siX.path" /></svg>
                  </button>
                  <button class="p-2 hover:text-primary" title="Share on LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </button>
                  <button class="p-2 hover:text-primary" title="Share on Facebook">
                    <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path :d="siFacebook.path" /></svg>
                  </button>
                  <button class="p-2 hover:text-primary" title="Copy Link" @click="copyPageUrl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </button>
                </div>
              </div>
              
              <!-- Table of Contents -->
              <div v-if="tableOfContents.length > 0" class="p-4 border border-border rounded-md">
                <h3 class="text-lg font-semibold mb-2">Table of Contents</h3>
                <nav>
                  <ul class="space-y-1 text-sm">
                    <li v-for="(item, index) in tableOfContents" :key="index" class="pl-2">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="container mx-auto px-8 py-8 text-left border-t">
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { marked } from 'marked';
import yaml from 'js-yaml';
import BlogHeader from '../components/BlogHeader.vue';
import Footer from '../components/Footer.vue';
import { useHead } from '@unhead/vue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { siX, siFacebook } from 'simple-icons';

// Define props using defineProps
const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const post = ref(null);
const error = ref(null);
const tableOfContents = ref([]);
const headData = ref({});

// Initialize head in setup context
useHead(headData);

// Computed property to format the date
const formattedDate = computed(() => {
  if (post.value && post.value.date instanceof Date) {
    try {
      return post.value.date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return post.value.date.toISOString().split('T')[0];
    }
  }
  return null;
});

// Function to copy the current page URL to clipboard
const copyPageUrl = () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      alert('Link copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy link: ', err);
    });
};

// Function to extract headings and build table of contents
const extractTableOfContents = (htmlContent) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Select all h2 and h3 headings for more comprehensive TOC
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

// Function to fetch and process the blog post
const fetchPost = async (slug) => {
  if (!slug) return;
  error.value = null;
  post.value = null;
  tableOfContents.value = [];
  
  try {
    const modules = import.meta.glob('/src/blog/*.md', { as: 'raw' });
    const modulePath = `/src/blog/${slug}.md`;

    if (modules[modulePath]) {
      const rawContent = await modules[modulePath]();

      // --- Manual Frontmatter Parsing ---
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

      // --- Render Markdown using marked ---
      const htmlContent = marked(markdownContent);
      
      // Extract table of contents and get HTML with IDs
      const { toc, htmlWithIds } = extractTableOfContents(htmlContent);
      tableOfContents.value = toc;

      // Attempt to parse the date string into a Date object
      let parsedDate = null;
      if (frontmatter.date) {
        try {
          parsedDate = new Date(frontmatter.date);
          if (isNaN(parsedDate.getTime())) {
            console.warn(`Invalid date format in frontmatter: ${frontmatter.date}. Falling back.`);
            parsedDate = null;
          }
        } catch (e) {
          console.error(`Error parsing date string "${frontmatter.date}":`, e);
          parsedDate = null;
        }
      }

      post.value = {
        title: frontmatter.title || 'Untitled Post',
        description: frontmatter.description || '',
        author: frontmatter.author || null,
        date: parsedDate,
        tags: frontmatter.tags || [], // Extract tags from frontmatter
        content: htmlWithIds, // Use the HTML with IDs already applied
      };
      
      // Update head metadata when post is loaded
      headData.value = {
        title: `Superchange.ai | ${post.value.title}` || 'Superchange.ai | Blog Post',
        meta: [
          { name: 'description', content: post.value.description || 'Read this blog post on Superchange.ai.' },
          { property: 'og:title', content: `Superchange.ai | ${post.value.title}` || 'Blog Post' },
          { property: 'og:description', content: post.value.description || 'Read this blog post on Superchange.ai.' },
          { property: 'og:type', content: 'article' },
          { property: 'article:published_time', content: post.value.date?.toISOString() || '' },
          { property: 'article:tag', content: post.value.tags?.join(', ') || '' }
        ]
      };
      
    } else {
       throw new Error(`Blog post not found at path: ${modulePath}`);
    }
  } catch (e) {
    console.error('Failed to fetch or process post:', e);
    error.value = 'Failed to load the post.';
    post.value = { title: 'Error', content: error.value };
  }
};

// Fetch post when the component is mounted
onMounted(() => {
  fetchPost(props.slug);
});

// Watch for changes in the slug prop and refetch if it changes
watch(() => props.slug, (newSlug) => {
  fetchPost(newSlug);
});
</script>

<style scoped>
/* Deep selector needed to style elements inside v-html */
:deep(h1) {
  font-size: 2.5em;
  margin-bottom: 1rem;
  font-weight: 800;
}
:deep(h2) {
  font-size: 1.9em;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
:deep(h3) {
  font-weight: bold;
  margin-bottom: 0.75rem;
}

:deep(hr) {
  margin-top: 2rem;
  margin-bottom: 2rem;
  border-top-width: 1px;
}

:deep(main .content a) {
  color: hsl(var(--primary));
}

:deep(p) {
  margin-bottom: 1rem;
}

/* --- Table Styles --- */
/* Table container with horizontal scroll */
:deep(.content table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-collapse: collapse;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

:deep(th), :deep(td) {
  border: 1px solid hsl(var(--border));
  padding: 8px 12px;
  text-align: left;
  font-size: 0.8em;
  min-width: 100px;
}

:deep(th) {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-weight: bold;
}

/* --- End Table Styles --- */

/* --- List Styles --- */
:deep(ul) {
  list-style-type: disc;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-left: 2rem;
}

:deep(li) {
  margin-bottom: 0.5rem;
}

/* --- End List Styles --- */

/* --- Blockquote Styles --- */
:deep(blockquote) {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 0rem 1.5rem;
  border-left: 4px solid hsl(var(--primary));
  font-style: bold;
}

:deep(blockquote p:last-child) {
  margin-bottom: 0;
}
/* --- End Blockquote Styles --- */
</style>