'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  Columns3,
  RefreshCcw,
  Zap,
  Clock,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import type { Campaign } from '@/hooks/useCampaigns'

interface CampaignsTableProps {
  data: Campaign[]
  isLoading?: boolean
  onView: (campaign: Campaign) => void
  onDelete: (id: string) => void
  searchQuery?: string
}

const EVENT_COLORS = [
  'bg-primary',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
]

export function CampaignsTable({ data, isLoading, onView, onDelete, searchQuery = '' }: CampaignsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: unknown }[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState(searchQuery)

  useEffect(() => {
    setGlobalFilter(searchQuery)
  }, [searchQuery])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const columns: ColumnDef<Campaign>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Campaign
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {row.original.name}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">ID: {row.original.offerID}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation()
                handleCopy(String(row.original.offerID), row.original._id || '')
              }}
            >
              {copiedId === row.original._id ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'events',
      header: 'Events',
      cell: ({ row }) => {
        const events = row.original.events || []
        const maxShow = 4
        const shown = events.slice(0, maxShow)
        const remaining = events.length - maxShow

        return (
          <div className="flex items-center gap-1">
            {shown.map((event, i) => (
              <Tooltip key={i}>
                <TooltipTrigger
                  render={
                    <div
                      className={`w-6 h-6 rounded-full ${EVENT_COLORS[i % EVENT_COLORS.length]} flex items-center justify-center text-[10px] font-bold text-white cursor-default`}
                    >
                      {event.name?.charAt(0) || '?'}
                    </div>
                  }
                />
                <TooltipContent>
                  <p>{event.name}</p>
                  <p className="text-xs text-muted-foreground">₹{event.user || '0'}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {remaining > 0 && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium cursor-default">
                      +{remaining}
                    </div>
                  }
                />
                <TooltipContent>
                  <p>{remaining} more events</p>
                </TooltipContent>
              </Tooltip>
            )}
            {events.length === 0 && (
              <Badge variant="outline" className="text-xs">
                No events
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'tracking',
      header: 'Tracking',
      cell: ({ row }) => {
        const tracking = row.original.tracking
        if (!tracking) {
          return <Badge variant="secondary">Not set</Badge>
        }
        return (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={tracking}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate max-w-[150px] block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tracking.slice(0, 30)}...
                  </a>
                }
              />
              <TooltipContent className="max-w-xs">
                <p className="font-mono text-xs break-all">{tracking}</p>
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              render={<a href={tracking} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'campStatus',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.campStatus
        const hasEvents = (row.original.events?.length || 0) > 0

        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                <Zap className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Paused
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const campaign = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // 👈 default rows per page
      },
      columnVisibility: {
        click: false,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                <div className="w-16 h-6 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onView(row.original)}
                  data-state={row.getIsSelected() && 'selected'}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl opacity-20">📭</div>
                    <p className="text-muted-foreground">No campaigns found</p>
                    <Button variant="outline" size="sm" render={<Link href="/dashboard/campaigns" />}>
                      Create your first campaign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 justify-between">
        {/* Rows per page */}
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>

          <SelectContent>
            {[5, 10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Existing pagination */}
        <div className='flex gap-2 items-center'>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns3 className="h-4 w-4" />
                  Columns
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    className="capitalize"
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.resetColumnVisibility()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1 border rounded-md">

            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="px-3 py-1 text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
