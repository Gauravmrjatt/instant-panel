"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayments, Payment } from "@/hooks/usePayments";

import {
  Receipt,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Calendar,
  ArrowUpDown as ArrowUpDownIcon,
  Copy,
  Check,
} from "lucide-react";
import {toast} from "sonner";
const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <CreditCard className="h-4 w-4 text-primary" />
        </div>
        <span className="font-mono text-sm">{row.original.number}</span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-bold text-lg">
        ₹{row.original.amount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "comment",
    header: "Message",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 max-w-[200px]">
        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm truncate">
          {row.original.comment || (
            <span className="text-muted-foreground italic">No message</span>
          )}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.original.type?.toLowerCase() || "unknown";
      const typeConfig: Record<
        string,
        { label: string; color: string; bg: string }
      > = {
        approved: {
          label: "Approved",
          color: "text-emerald-600",
          bg: "bg-emerald-500/10",
        },
        paid: {
          label: "Paid",
          color: "text-emerald-600",
          bg: "bg-emerald-500/10",
        },
        success: {
          label: "Success",
          color: "text-emerald-600",
          bg: "bg-emerald-500/10",
        },
        rejected: {
          label: "Rejected",
          color: "text-red-600",
          bg: "bg-red-500/10",
        },
        failed: { label: "Failed", color: "text-red-600", bg: "bg-red-500/10" },
        pending: {
          label: "Pending",
          color: "text-amber-600",
          bg: "bg-amber-500/10",
        },
        processing: {
          label: "Processing",
          color: "text-blue-600",
          bg: "bg-blue-500/10",
        },
      };
      const config = typeConfig[type] || {
        label: type,
        color: "text-muted-foreground",
        bg: "bg-muted",
      };
      return (
        <Badge className={`${config.bg} ${config.color} gap-1`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "response",
    header: "Status",
    cell: ({ row }) => {
      const response = row.original.response;
      const isSuccess =
        typeof response === "string"
          ? response.toLowerCase() === "success"
          : response?.status?.toLowerCase() === "success";
      const message = typeof response === "object" ? response?.message : null;

      return (
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Success
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10 gap-1">
              <XCircle className="h-3 w-3" />
              {message || "Failed"}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm">
          <div className="font-medium">{date.toLocaleDateString()}</div>
          <div className="text-muted-foreground text-xs">
            {date.toLocaleTimeString()}
          </div>
        </div>
      );
    },
  },
];

export default function PaymentsPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, refetch, isRefetching } = usePayments(page);

  const payments = data?.data || [];
  const total = data?.total || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.type?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    successCount: payments.filter((p) => {
      const response = p.response;
      return typeof response === "string"
        ? response.toLowerCase() === "success"
        : response?.status?.toLowerCase() === "success";
    }).length,
    pendingCount: payments.filter((p) => p.type?.toLowerCase() === "pending")
      .length,
  };

  const table = useReactTable({
    data: filteredPayments,
    columns,
    state: {
      sorting,
      pagination: { pageIndex: page, pageSize },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page, pageSize });
        setPage(newState.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: totalPages,
  });

  return (
    <div className="space-y-6  w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <Receipt className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payment History
            </h1>
            <p className="text-muted-foreground">
              View and manage all your payment transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Page</p>
                <p className="text-3xl font-bold">{stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <IndianRupee className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Total</p>
                <p className="text-3xl font-bold">
                  ₹{stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.successCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">All Transactions</CardTitle>
                <CardDescription>
                  {total} total payment(s) recorded
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px] md:w-[300px] rounded-lg"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="font-semibold">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
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
                        style={{
                          animationDelay: `${index * 30}ms`,
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground">
                            No payments found
                          </p>
                          {searchQuery && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setSearchQuery("")}
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg m-6">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Receipt className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No Payment Records</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Payment history will appear here once you start making payments
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {page * pageSize + 1} to{" "}
              {Math.min((page + 1) * pageSize, total)} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="hidden sm:flex"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page < 3) {
                    pageNum = i;
                  } else if (page > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="hidden sm:flex"
              >
                Last
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
