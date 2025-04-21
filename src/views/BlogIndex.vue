<template>
    <div class="flex flex-col min-h-screen bg-background text-foreground">
        <header class="py-6 border-b border-border">
            <BlogHeader />
        </header>
        <main>
            <div class="container mx-auto px-8 py-8 text-left">
                <h1 class="text-3xl font-bold mb-4">Latest</h1>
                <ul>
                    <li v-for="post in posts" :key="post.slug" class="mb-2 text-xxl">
                        <router-link :to="`/blog/${post.slug}`">
                            {{ post.title }}
                        </router-link>
                        <span v-if="post.date" class="text-sm text-muted-foreground ml-2">
                            ({{ new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric'}) }})
                        </span>
                    </li>
                </ul>
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
                }
            } catch (e) {
                console.error(`Error parsing frontmatter for ${slug}.md:`, e);
                // Keep default title/date or handle error as needed
            }
        }

        return { slug, title, date };
    });
});
</script>