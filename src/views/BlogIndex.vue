<template>
    <div class="flex flex-col min-h-screen bg-background text-foreground">
        <header class="py-6 border-b border-border">
            <BlogHeader />
        </header>
        <main>
            <div class="container mx-auto px-8 py-8 text-left">
                <article v-for="post in posts" :key="post.slug" class="mb-6 border-b py-10">
                    <!-- Category tag with gradient -->
                    <div v-if="post.tags && post.tags.length" class="mb-1">
                        <span class="text-sm font-medium category-tag">
                            {{ post.tags[0] }}
                        </span>
                    </div>
                    
                    <!-- Post title -->
                    <router-link :to="`/blog/${post.slug}`" class="block">
                        <h2 class="text-xxl font-semibold">
                        {{ post.title }}
                        </h2>
                    </router-link>
                    
                    <!-- Post date -->
                    <span v-if="post.date" class="text-sm text-muted-foreground">
                        {{ new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric'}) }}
                    </span>
                    
                    <!-- Post description -->
                    <p v-if="post.description" class="mt-2 text-muted-foreground">
                        {{ post.description }}
                    </p>
                </article>
            </div>
        </main>
        <footer class="container mx-auto px-8 py-8 text-left">
            <Footer />
        </footer>
    </div>
    
</template>

<script setup>
import { ref, onMounted } from 'vue';
import yaml from 'js-yaml';
import { useColorMode } from '@vueuse/core'

import BlogHeader from '../components/BlogHeader.vue';
import Footer from '../components/Footer.vue';
const posts = ref([]);
useColorMode()

onMounted(async () => {
    // Import raw content of Markdown files
    const modules = import.meta.glob('../blog/*.md', { as: 'raw', eager: true });
    const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/; // Regex to extract frontmatter

    posts.value = Object.entries(modules).map(([path, rawContent]) => {
        const slug = path.split('/').pop().replace('.md', '');
        let title = 'Untitled Post'; // Default title
        let date = null; // Default date
        let description = null; // Default description
        let tags = []; // Default tags

        // --- Manual Frontmatter Parsing ---
        const match = rawContent.match(frontmatterRegex);
        if (match && match[1]) {
            try {
                const frontmatter = yaml.load(match[1]);
                if (frontmatter && typeof frontmatter === 'object') {
                    if (frontmatter.title) {
                        title = frontmatter.title;
                    }
                    if (frontmatter.date) {
                        date = frontmatter.date;
                    }
                    if (frontmatter.description) {
                        description = frontmatter.description;
                    }
                    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
                        tags = frontmatter.tags;
                    }
                }
            } catch (e) {
                console.error(`Error parsing frontmatter for ${slug}.md:`, e);
                // Keep default title/date or handle error as needed
            }
        }

        return { slug, title, date, description, tags };
    });
});
</script>

<style scoped>
.category-tag {
    background-image: linear-gradient(90deg, #285FFD 0%, #A32ED0 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 600;
    display: inline-block;
}

:deep(h2) {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.75rem;
}
</style>