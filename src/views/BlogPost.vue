<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">
    <header class="py-6 border-b border-border">
      <BlogHeader />
    </header>
    <main>
      <div class="container mx-auto px-8 py-8 text-left">
        <!-- Breadcrumb added here -->
        <Breadcrumb class="mb-4"> <!-- Add margin-bottom for spacing -->
          <BreadcrumbList>
            <BreadcrumbItem>
              <!-- Assuming your blog list page is at /blog -->
              <BreadcrumbLink href="/blog">
                Blog
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <!-- Display post title if available, otherwise 'Post' -->
              <BreadcrumbPage>{{ post ? post.title : 'Post' }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 v-if="post">{{ post.title }}</h1>
        <div v-if="post" class="text-sm text-muted-foreground mb-4"> <!-- Added container for meta info -->
          <span v-if="post.author">By {{ post.author }}</span>
          <span v-if="post.author && formattedDate"> | </span> <!-- Separator, check formattedDate -->
          <span v-if="formattedDate">{{ formattedDate }}</span> <!-- Display formatted date -->
        </div>
        <div v-if="post" v-html="post.content"></div>
        <div v-else>Loading post...</div>
      </div>
    </main>
    <footer class="container mx-auto px-8 py-8 text-left">
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'; // Import computed
import { marked } from 'marked';
import yaml from 'js-yaml';
import BlogHeader from '../components/BlogHeader.vue';
import Footer from '../components/Footer.vue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Define props using defineProps
const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const post = ref(null);
const error = ref(null); // Optional: for error handling

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
      // Optionally return the original date string or an error message
      return post.value.date.toISOString().split('T')[0]; // Fallback to ISO date string YYYY-MM-DD
    }
  }
  return null; // Return null if no valid date
});


// Function to fetch and process the blog post
const fetchPost = async (slug) => {
  if (!slug) return;
  error.value = null; // Reset error on new fetch
  post.value = null; // Reset post while loading
  try {
    // Use import.meta.glob to dynamically import the specific markdown file's raw content
    // Adjust the path '/src/blog/*.md' if your blog files are located elsewhere relative to the project root
    const modules = import.meta.glob('/src/blog/*.md', { as: 'raw' });
    const modulePath = `/src/blog/${slug}.md`;

    if (modules[modulePath]) {
      const rawContent = await modules[modulePath](); // Execute the dynamic import function

      // --- Manual Frontmatter Parsing --- (Keep this part)
      const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
      const match = rawContent.match(frontmatterRegex);

      let frontmatter = {};
      let markdownContent = rawContent;

      if (match && match[1]) {
        try {
          frontmatter = yaml.load(match[1]);
          // Remove frontmatter section from the content
          markdownContent = rawContent.substring(match[0].length).trim();
        } catch (e) {
          console.error('Error parsing frontmatter:', e);
          // Decide how to handle YAML parsing errors, maybe proceed without frontmatter
        }
      }
      // --- End Manual Frontmatter Parsing ---


      // --- Render Markdown using marked --- (Keep this part)
      const htmlContent = marked(markdownContent);
      // --- End Render Markdown ---

      // Attempt to parse the date string into a Date object
      let parsedDate = null;
      if (frontmatter.date) {
        try {
          parsedDate = new Date(frontmatter.date);
          // Basic validation: Check if the parsed date is valid
          if (isNaN(parsedDate.getTime())) {
            console.warn(`Invalid date format in frontmatter: ${frontmatter.date}. Falling back.`);
            parsedDate = null; // Reset if invalid
          }
        } catch (e) {
          console.error(`Error parsing date string "${frontmatter.date}":`, e);
          parsedDate = null; // Ensure it's null on error
        }
      }

      post.value = {
        title: frontmatter.title || 'Untitled Post', // Use a default title if none found
        author: frontmatter.author || null, // Extract author, default to null
        date: parsedDate, // Store the parsed Date object (or null)
        content: htmlContent,
      };
    } else {
       throw new Error(`Blog post not found at path: ${modulePath}`);
    }
  } catch (e) {
    console.error('Failed to fetch or process post:', e);
    error.value = 'Failed to load the post.'; // Set error message
    post.value = { title: 'Error', content: error.value }; // Display error in the component
  }
};

// Fetch post when the component is mounted
onMounted(() => {
  fetchPost(props.slug);
});

// Optional: Watch for changes in the slug prop and refetch if it changes
watch(() => props.slug, (newSlug) => {
  fetchPost(newSlug);
});

</script>

<style scoped>
/* Deep selector needed to style elements inside v-html */
:deep(h1) {
  font-size: 2.5em;
  margin-bottom: 1rem; /* Add some space below h1 */
}
:deep(h2) {
  font-size: 1.9em;
  font-weight: bold;
  /* padding: 10px 0px; Remove padding if margin is preferred */
  margin-top: 1.5rem; /* Add space above h2 */
  margin-bottom: 0.75rem; /* Add space below h2 */
}
:deep(h3) {
  font-weight: bold;
  margin-top: 1.5rem; /* Add space above h2 */
  margin-bottom: 0.75rem; /* Add space below h2 */
}

:deep(hr) {
  margin-top: 2rem; /* Add space above hr */
  margin-bottom: 2rem; /* Add space below hr */
  border-top-width: 1px; /* Ensure hr is visible */
}

/* Add general spacing for paragraphs if needed */
:deep(p) {
  margin-bottom: 1rem;
}

/* --- Table Styles --- */
:deep(table) {
  width: 100%; /* Make table take full width */
  border-collapse: collapse; /* Collapse borders */
  margin-top: 1.5rem; /* Space above table */
  margin-bottom: 1.5rem; /* Space below table */
  border: 1px solid hsl(var(--border)); /* Use --border variable */
}

:deep(th), :deep(td) {
  border: 1px solid hsl(var(--border)); /* Use --border variable for cell borders */
  padding: 8px 12px; /* Padding inside cells */
  text-align: left; /* Align text to the left */
}

:deep(th) {
  background-color: hsl(var(--muted)); /* Use --muted variable for header background */
  color: hsl(var(--muted-foreground)); /* Use corresponding foreground color */
  font-weight: bold; /* Make header text bold */
}

:deep(tr:nth-child(even)) {
  background-color: hsl(var(--secondary)); /* Use --secondary variable for zebra striping */
}
/* --- End Table Styles --- */

/* --- List Styles --- */
:deep(ul) {
  list-style-type: disc; /* Use standard disc bullets */
  margin-top: 1rem; /* Space above the list */
  margin-bottom: 1rem; /* Space below the list */
  padding-left: 2rem; /* Indent the list */
}

:deep(li) {
  margin-bottom: 0.5rem; /* Space below each list item */
}

/* --- End List Styles --- */

/* --- Blockquote Styles --- */
:deep(blockquote) {
  margin-top: 1.5rem; /* Space above blockquote */
  margin-bottom: 1.5rem; /* Space below blockquote */
  padding: 0rem 1.5rem; /* Padding inside blockquote */
  border-left: 4px solid hsl(var(--primary)); /* Left border using primary color */
  font-style: bold; /* Italicize text */
}

/* Optional: Remove bottom margin from the last paragraph inside a blockquote */
:deep(blockquote p:last-child) {
  margin-bottom: 0;
}
/* --- End Blockquote Styles --- */

</style>