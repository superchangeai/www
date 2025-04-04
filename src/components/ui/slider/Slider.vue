<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardPropsEmits } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<SliderRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<SliderRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SliderRoot
    :class="cn(
      'relative flex w-full touch-none select-none items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:w-1.5 data-[orientation=vertical]:h-full',
      props.class,
    )"
    v-bind="forwarded"
  >
    <SliderTrack class="relative h-2 w-full data-[orientation=vertical]:w-2 grow overflow-hidden rounded-full bg-primary/20">
      <SliderRange class="absolute h-full data-[orientation=vertical]:w-full bg-primary" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, index) in Array.isArray(modelValue) ? modelValue : [modelValue]"
      :key="index"
      class="block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-lg ring-offset-background transition-colors hover:bg-accent hover:border-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
    />
  </SliderRoot>
</template>
