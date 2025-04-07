<script setup lang="ts">
import type {
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import { cn, valueUpdater } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import Header from '@/components/Header.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ChevronDown, ChevronsUpDown, Ellipsis } from 'lucide-vue-next'
import { h, ref, onMounted, computed } from 'vue'
import { Bell } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { alertSubscriptionsService } from '@/api/services/alert-subscriptions.service'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()

export interface AlertProvider {
  id: number
  name: string
}

export interface AlertChannel {
  email_channel_id: number
  email_to: string
  frequency_level: string
}

export interface AlertSubscription {
  id: number
  channels: AlertChannel[]
  providers: AlertProvider[]
  classifications: string[]
  created_at?: string
}

export interface Alerts {
  id: number
  created: string
  channels: string
  providers: string
  updates: string
}

const data = ref<Alerts[]>([])

const formatClassifications = (classifications: string[]): string => {
  if (!classifications.length) return ''
  if (classifications.length === 1) return classifications[0]
  const displayItems = classifications.slice(0, 2)
  const remaining = classifications.length - 2
  return remaining > 0 
    ? `${displayItems.join(', ')} and ${remaining} more`
    : displayItems.join(', ')
}

const columnHelper = createColumnHelper<Alerts>()

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'modelValue': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
      'onUpdate:modelValue': value => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Select all',
    }),
    cell: ({ row }) => {
      return h(Checkbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': value => row.toggleSelected(!!value),
        'ariaLabel': 'Select row',
      })
    },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('providers', {
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Providers', h(ChevronsUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('providers')),
  }),
  columnHelper.accessor('channels', {
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Channels', h(ChevronsUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('channels')),
  }),
  columnHelper.accessor('updates', {
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Updates', h(ChevronsUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('updates')),
  }),
  columnHelper.accessor('created', {
    header: () => h('div', { class: 'text-right' }, 'Created'),
    cell: ({ row }) => h('div', { class: 'text-right font-medium' }, row.getValue('created')),
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => h('div', { class: 'text-right' }, [
      h(Popover, {}, {
        default: () => [
          h(PopoverTrigger, { asChild: true }, () => [
            h(Button, { variant: 'ghost', size: 'icon' }, () => [
              h(Ellipsis, { class: 'h-3 w-3' })
            ])
          ]),
          h(PopoverContent, { class: 'w-40 p-0' }, () => [
            h('div', { class: 'flex flex-col' }, [
              // TODO 
              // h('router-link', {
              //   to: `/alerts/edit/${row.original.id}`,
              //   class: 'opacity-50 bg-muted cursor-not-allowed p-2 hover:bg-muted text-sm no-underline text-inherit'
              // }, 'Edit'),
              h('button', {
                class: 'p-2 hover:bg-muted text-sm text-left text-destructive',
                onClick: () => openDeleteDialog(row.original.id)
              }, 'Delete')
            ])
          ])
        ]
      })
    ])
  }),
]

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})

const table = useVueTable({
  get data() { return data.value },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
    get expanded() { return expanded.value },
  },
})
const isLoading = ref(false)
const error = ref<string | null>(null)
const isDeleteDialogOpen = ref(false)
const alertToDelete = ref<number | null>(null)

// Skeleton loading state
const skeletonRows = Array(2).fill(null)

// Fetch Alerts from API
const formatProviders = (providers: AlertProvider[]): string => {
  if (!providers.length) return ''
  if (providers.length === 1) return providers[0].name
  const displayItems = providers.slice(0, 2).map(p => p.name)
  const remaining = providers.length - 2
  return remaining > 0 
    ? `${displayItems.join(', ')} and ${remaining} more`
    : displayItems.join(', ')
}

const formatFrequency = (frequencyLevel: string) => {
    return frequencyLevel
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const formatChannels = (channels: AlertChannel[]): string => {
  return channels.length ? `${channels[0].email_to} (${formatFrequency(channels[0].frequency_level)})` : ''
}

// Function to open the delete dialog
const openDeleteDialog = (alertId: number) => {
  alertToDelete.value = alertId
  isDeleteDialogOpen.value = true
}

// Function to confirm and execute the delete action
const confirmDelete = async () => {
  if (!alertToDelete.value) return
  
  try {
    isLoading.value = true
    await alertSubscriptionsService.delete(alertToDelete.value)
    
    // Refresh the alerts list
    await fetchAlerts()
    
    toast({
      title: 'Alert deleted',
      description: 'The alert has been successfully deleted.',
    })
  } catch (error) {
    console.error('Error deleting alert:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete the alert',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
    isDeleteDialogOpen.value = false
    alertToDelete.value = null
  }
}

const fetchAlerts = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await alertSubscriptionsService.getAll();
    data.value = response.map(alert => ({
      id: alert.id,
      created: alert.created_at ? new Date(alert.created_at).toLocaleDateString('en-GB') : '',
      channels: formatChannels(alert.channels),
      providers: formatProviders(alert.providers),
      updates: formatClassifications(alert.classifications)
    }));
    console.log(data.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : null
  } finally {
    isLoading.value = false
  }
}

// Load alerts on component mount
onMounted(() => {
  fetchAlerts()
})

// config the header
const currentConfig = computed(() => ({
  isLoading: isLoading.value
}))


</script>

<template>
    <Header 
      :title="'Alerts'"
      :icon="Bell"
      :show-filter-button="false" 
      :show-help-button="true"
      :is-loading="currentConfig.isLoading"
    >
    <template #actions>
        <router-link :to="'/alerts/new'">
          <Button>
            <Bell class="mr-2 h-4 w-4" /> Create an alert
          </Button>
        </router-link>
    </template>
    </Header>
  <div class="w-full py-2 px-3 md:px-11">
    <div class="flex gap-2 items-center py-4" v-if="data.length > 0">
      <Input
        class="max-w-sm"
        placeholder="Filter providers..."
        :model-value="table.getColumn('providers')?.getFilterValue() as string"
        @update:model-value=" table.getColumn('providers')?.setFilterValue($event)"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="(value) => {
              column.toggleVisibility(!!value)
            }"
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers" :key="header.id" :data-pinned="header.column.getIsPinned()"
              :class="cn(
                { 'sticky bg-background/95': header.column.getIsPinned() },
                header.column.getIsPinned() === 'left' ? 'left-0' : 'right-0',
              )"
            >
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell
                  v-for="cell in row.getVisibleCells()" :key="cell.id" :data-pinned="cell.column.getIsPinned()"
                  :class="cn(
                    { 'sticky bg-background/95': cell.column.getIsPinned() },
                    cell.column.getIsPinned() === 'left' ? 'left-0' : 'right-0',
                  )"
                >
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()">
                <TableCell :colspan="row.getAllCells().length">
                  {{ JSON.stringify(row.original) }}
                </TableCell>
              </TableRow>
            </template>
          </template>
          <!-- Skeleton loading state -->
          <template v-if="isLoading && !table.getRowModel().rows?.length">
            <TableRow v-for="i in skeletonRows" :key="i">
              <TableCell v-for="column in columns" :key="column.id">
                <Skeleton class="h-6 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <!-- No data state (only when API returns empty) -->
          <TableRow v-else-if="data.length === 0">
            <TableCell
              :colspan="columns.length"
              class="text-center"
            >
              <p class="pt-4 mb-4">You don't have alerts yet. <br> Set up alerts and be the first to know when something comes up!</p>         
              <router-link to="/alerts/new">
                <Button variant="secondary"><Bell class="mr-2 h-4 w-4"  />Create an alert</Button>
              </router-link>
              <p class="pt-4 mb-2"> </p> 
            </TableCell>
          </TableRow>
          <!-- No results from filtering -->
           
          <TableRow v-else-if="data.length > 0 && !table.getRowModel().rows?.length">
            <TableCell
              :colspan="columns.length"
              class="text-center"
            >
              <p class="pt-4 mb-4">No alerts match your current filters.</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div v-if="table.getFilteredRowModel().rows.length > 0" class="flex items-center justify-end space-x-2 py-4">
      <div class="flex-1 text-sm text-muted-foreground">
        {{ table.getFilteredSelectedRowModel().rows.length }} of
        {{ table.getFilteredRowModel().rows.length }} row(s) selected.
      </div>
    </div>
  </div>
    <!-- Alert Dialog for Delete Confirmation -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this alert?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this alert.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="isDeleteDialogOpen = false">Cancel</AlertDialogCancel>
                <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>