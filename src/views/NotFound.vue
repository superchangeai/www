<template>
    <div class="flex flex-col items-center gap-5 text-center p-10">
        <img src="/super.svg" class="h-20" alt="Superchange.ai logo" />
        <h1>404: Page not found</h1>
        <p class="border-b pb-10">Sorry, the page you're looking for doesn't exist :(</p>
        <router-link :to="'/'" class="flex items-center gap-2">
            Go back to 
            <img src="/super.svg" class="h-6" alt="Superchange.ai logo" />
            <span class="font-semibold">superchange.ai</span>
        </router-link>
    </div>
</template>
<script setup>
import { useColorMode } from '@vueuse/core'
useColorMode()
</script>