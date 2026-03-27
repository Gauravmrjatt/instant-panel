'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type VisibilityState,
  type PaginationState,
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
  ArrowUpDown,
  Columns3,
  RefreshCcw,
  Download,
  Info,
} from 'lucide-react'
import type { LeadData } from '@/hooks/useLeads'

interface LeadsTableProps {
  data: LeadData[]
  isLoading?: boolean
  campaignId: string
  searchQuery?: string
  pageCount: number
  totalCount: number
  pagination: PaginationState
  onPaginationChange: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  Approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Approved' },
  Pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending' },
  Rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
  REJECTED: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
  ACCEPTED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Accepted' },
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending' },
  FAILURE: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Failed' },
  default: { bg: 'bg-primary/10', text: 'text-primary', label: '' },
}

function getStatusStyle(status: string) {
  return statusStyles[status] || statusStyles.default
}

export function LeadsTable({
  data,
  isLoading,
  campaignId,
  searchQuery = '',
  pageCount,
  totalCount,
  pagination,
  onPaginationChange,
}: LeadsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: unknown }[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [internalFilter, setInternalFilter] = useState('')
  
  useEffect(() => {
    setInternalFilter(searchQuery)
  }, [searchQuery])
  
  const globalFilter = internalFilter

  const columns: ColumnDef<LeadData>[] = [
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
      accessorKey: 'event',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Event
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.original.event || '-'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const style = getStatusStyle(row.original.status)
        return (
          <Badge className={`${style.bg} ${style.text} hover:${style.bg}`}>
            {style.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'message',
      header: 'Msg',
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent>
            <p>{row.original.message || 'No message'}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: 'user',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.user || '-'}</span>
      ),
    },
    {
      accessorKey: 'refer',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Refer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.refer || '-'}</span>
      ),
    },
    {
      accessorKey: 'userAmount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          User Amt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">₹{row.original.userAmount?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      accessorKey: 'referAmount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Refer Amt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">₹{row.original.referAmount?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      accessorKey: 'params',
      header: 'Params',
      cell: ({ row }) => {
        const params = row.original.params
        if (!params || typeof params !== 'object') {
          return <span className="text-muted-foreground">-</span>
        }
        const paramsString = Object.entries(params)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n')
        return (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent className="max-w-xs">
              <pre className="text-xs whitespace-pre-wrap">{paramsString}</pre>
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Payment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const style = getStatusStyle(row.original.paymentStatus)
        return (
          <Badge className={`${style.bg} ${style.text} hover:${style.bg}`}>
            {style.label || row.original.paymentStatus}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'payMessage',
      header: 'Pay',
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent>
            <p>{row.original.payMessage || 'No message'}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        if (!row.original.createdAt) return '-'
        const date = new Date(row.original.createdAt)
        return (
          <span className="text-sm">
            {date.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )
      },
    },
    {
      accessorKey: 'click',
      header: 'Click ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.click || '-'}</span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/dashboard/camp/click/${row.original.id}?event=${row.original.event}`
                )
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount,
    initialState: {
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
                  className="hover:bg-muted/30 transition-colors"
                  data-state={row.getIsSelected() && 'selected'}
                  style={{
                    animationDelay: `${index * 20}ms`,
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
                    <p className="text-muted-foreground">No leads found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2 justify-between">
        {/* Rows per page + total count */}
        <div className="flex items-center gap-3">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              onPaginationChange({ pageIndex: 0, pageSize: Number(value) })
            }}
          >
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {totalCount} total leads
          </span>
        </div>
        {/* Pagination controls */}
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
              Page {pagination.pageIndex + 1} of {pageCount}
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
