<script setup>
import { Dialog,DialogClose, DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger, } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpenText } from 'lucide-vue-next'
import { defineProps, computed } from 'vue'

const props = defineProps({
  selectedChangelogId: {
    type: String,
    required: true
  },
  providers: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Sorts the providers alphabetically by name
const sortedProviders = computed(() => {
  // Create a shallow copy before sorting to avoid mutating the original prop
  return [...props.providers].sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })
})

</script>

<template>
  <Dialog v-if="selectedChangelogId !== 'default'">
    <DialogTrigger>
      <Button variant="ghost" size="icon" class="min-w-9">
        <BookOpenText class="h-5 w-5 text-muted-foreground" />
      </Button>
    </DialogTrigger>
    <DialogContent class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh]">
      <DialogHeader>
        <DialogTitle class="mb-5">
          <span class="flex flex-inline gap-2 items-center">
            <BookOpenText class="h-5" />Monitoring {{ providers.length }} providers
          </span>
        </DialogTitle>
        <DialogDescription class="text-left">
          The changelog you are viewing is summarizing updates shipped by:
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 overflow-y-auto">
        <div class="text-left text-sm text-muted-foreground">
          <ul>
            <li v-for="provider in sortedProviders" :key="provider.id">
              <a :href="`../providers/id/${provider.id}`">{{ provider.name }}</a>
            </li>
          </ul>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>