<template>
    <div class="container">
        <div class="flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center">
            <div class="">
                <router-link to="/" class="flex gap-2 items-center"><img src="/super.svg" width="40" alt="Superchange.ai logo" /> <span class="logo-text">superchange.ai</span></router-link>
            </div>
            <div class="footer-links hidden md:flex gap-3 md:flex-row md:justify-between md:items-center">
                <Button variant="ghost" size="sm" @click="toggleTheme" aria-label="Change theme">
                    <MoonStar class="h-5 w-5 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <SunMedium class="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                <a href="https://superchange.ai/#features" class="footer-link">Features</a>
                <a href="https://github.com/superchangeai" class="footer-link">GitHub</a>
                <router-link to="/docs" class="footer-link">Documentation</router-link>
                <router-link to="/blog" class="footer-link">Blog</router-link>
                <router-link to="/privacy" class="footer-link">Privacy</router-link>
                <!-- <router-link to="/terms" class="footer-link">Terms</router-link> -->
            </div>
        </div>
        <div class="copyright pb-5">
            <span>&copy; 2025 Superchange.ai. All rights reserved.</span>
            <span>
            <a href="https://startupfa.me/s/superchangeai?utm_source=www.superchange.ai" target="_blank">
                <img src="https://startupfa.me/badges/featured/dark-small.webp" alt="Featured on Startup Fame" width="154" class="hidden dark:inline" />
                <img src="https://startupfa.me/badges/featured/light-small.webp" alt="Featured on Startup Fame" width="154" class="inline dark:hidden" />
            </a>
            <a href="https://www.producthunt.com/posts/superchange-ai-ai-native-changelog?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-superchange&#0045;ai&#0045;ai&#0045;native&#0045;changelog" target="_blank">
                <img class="inline dark:hidden" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=964180&theme=neutral&t=1747018844239" alt="Superchange&#0046;ai&#0032;–&#0032;AI&#0045;native&#0032;Changelog - Stay&#0032;updated&#0032;on&#0032;what&#0032;YOU&#0032;build&#0032;on&#0046; | Product Hunt" style="width: 150px;" width="150" />
                <img class="hidden dark:inline" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=964180&theme=dark&t=1747018881847" alt="Superchange&#0046;ai&#0032;–&#0032;AI&#0045;native&#0032;Changelog - Stay&#0032;updated&#0032;on&#0032;what&#0032;YOU&#0032;build&#0032;on&#0046; | Product Hunt" style="width: 150px;" width="250" />
            </a>
            </span>
        </div>
    </div>
</template>
<script setup>
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import {
    MoonStar,
    SunMedium
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
const mode = useColorMode()
const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
}
</script>