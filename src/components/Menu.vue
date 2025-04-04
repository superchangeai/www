<script setup lang="ts">
import { ref } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BatteryCharging,
  Bot,
  Bell,
  Cloud,
  Contact,
  CreditCard,
//   Ellipsis,
  FileText,
  Github,
  HeartCrack,
  Mail,
  Package,
  Library,
  ShieldPlus,
  ServerCog,
  Zap
} from 'lucide-vue-next'

defineOptions({
  name: 'Menu'
})

const feedItems = ref([
  { type: 'all', label: 'All', icon: Zap },  
  { type: 'breaking', label: 'Breaking', icon: HeartCrack, count: 5 },
  { type: 'security', label: 'Security', icon: ShieldPlus, count: 12 },
  { type: 'performance', label: 'Performance', icon: BatteryCharging },
  { type: 'feature', label: 'New Feature', icon: Package },
  { type: 'minor', label: 'Minor Fix', icon: FileText },
  { type: 'other', label: 'Other', icon: Library }
])

const Providers = ref([
  { type: 'all', label: 'All', icon: Zap },
  { type: 'ai', label: 'AI', icon: Bot },
  { type: 'cloud', label: 'Cloud', icon: Cloud },
  { type: 'crm', label: 'CRM', icon: Contact },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'payment', label: 'Payment', icon: CreditCard },
//   { type: 'more', label: 'More', icon: Ellipsis },
])

</script>
<template>

<Accordion type="single" class="w-full" :default-value="'1'">
<!-- Feed section -->
<AccordionItem value="1">
    <AccordionTrigger class="text-[12px] text-muted-foreground pl-6 uppercase tracking-[.10em]">Feed</AccordionTrigger>
    <AccordionContent>
        <div class="px-3 space-y-1">
        <router-link
            v-for="item in feedItems"
            :key="item.type"
            :to="`/feed/${item.type}`"
            custom
            v-slot="{ navigate, isActive }"
        >
            <Button
                variant="ghost"
                class="w-full justify-start font-normal"
                :class="{ 'bg-accent': isActive }"
                @click="navigate"
            >
                <component :is="item.icon" class="mr-2 h-4 w-4" />
                {{ item.label }}
                <!-- <Badge v-if="item.count" variant="secondary" class="ml-auto">{{ item.count }}</Badge> -->
            </Button>
        </router-link>
        </div>
    </AccordionContent>
    </AccordionItem>
    <!-- Providers section -->
    <AccordionItem value="2">
    <AccordionTrigger class="text-[12px] text-muted-foreground pl-6 uppercase tracking-[.10em]">Providers</AccordionTrigger>
    <AccordionContent>
        <div class="px-3 space-y-1">
        <router-link
            v-for="provider in Providers"
            :key="provider.type"
            :to="`/providers/${provider.type}`"
            custom
            v-slot="{ navigate, isActive }"
        >
            <Button
                variant="ghost"
                class="w-full justify-start font-normal"
                :class="{ 'bg-accent': isActive }"
                @click="navigate"
            >
                <component :is="provider.icon" class="mr-2 h-4 w-4" />
                {{ provider.label }}
            </Button>
        </router-link>
        </div>
    </AccordionContent>
    </AccordionItem>  
    <!-- Actions section -->
    <AccordionItem value="3" class="border-b-0">
    <AccordionTrigger class="text-[12px] text-muted-foreground pl-6 uppercase tracking-[.10em]">Actions</AccordionTrigger>
    <AccordionContent>
        <div class="px-3 space-y-1">
        <router-link :to="`/alerts/`" custom v-slot="{ navigate, isActive }">
            <Button
                variant="ghost"
                class="w-full justify-start font-normal"
                :class="{ 'bg-accent': isActive }"
                @click="navigate"
            ><Bell class="mr-2 h-4 w-4" /> Alerts
            <Badge variant="secondary" class="ml-auto">beta</Badge>
            </Button>
        </router-link>
        <Button variant="ghost" class="w-full justify-start font-normal" disabled>
        <Github class="mr-2 h-4 w-4" />
            Github<Badge variant="secondary" class="ml-auto">soon</Badge>
        </Button>
        <Button variant="ghost" class="w-full justify-start font-normal" disabled>
        <ServerCog class="mr-2 h-4 w-4" />
            MCP<Badge variant="secondary" class="ml-auto">soon</Badge>
        </Button>                  
        </div>
    </AccordionContent>
</AccordionItem>       
</Accordion>
</template>