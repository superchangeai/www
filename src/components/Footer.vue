<template>
    <div class="container">
        <div class="flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center">
            <div class="flex gap-2 items-center">
                <img src="/super.svg" width="40" /> <span class="logo-text">superchange.ai</span>
            </div>
            <div class="footer-links hidden md:flex gap-3 md:flex-row md:justify-between md:items-center">
                <Button variant="ghost" size="sm" @click="toggleTheme">
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
        <div class="copyright">
            &copy; 2025 Superchange.ai. All rights reserved.
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