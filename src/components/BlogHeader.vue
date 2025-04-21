<template>
    <div class="container mx-auto px-8 flex justify-between items-center">
        <router-link :to="'/blog'" class="flex items-center gap-2">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6" />
            <span class="font-semibold text-lg">superchange.ai</span>
            <Badge variant="outline">blog</Badge>
        </router-link>
        <nav class="flex gap-4 items-center">
            <!-- Desktop Navigation -->
            <div class="flex gap-6 items-center">
                <a href="https://github.com/superchangeai" class="hidden md:flex text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 flex gap-2 items-center">
                    <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path :d="siGithub.path" /></svg>
                </a>
                <router-link :to="'/feed/'">
                    <Button size="">
                        Browse the changes
                    </Button>
                </router-link>
            </div>
            
        </nav>
        
    </div>
</template>
<script setup>
import { siGithub } from 'simple-icons';
import { useColorMode } from '@vueuse/core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
useColorMode()
</script>