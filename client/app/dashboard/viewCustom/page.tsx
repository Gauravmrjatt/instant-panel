"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiConfig, authFetch } from "@/lib/config";
import {toast} from "sonner";
import {
  Sparkles,
  Search,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash,
  IndianRupee,
  
  Users,
  FileText,
  Loader2,
} from "lucide-react";

interface CustomAmount {
  _id: string;
  campId: string;
  event: string;
  number: string;
  name: string;
  referAmount: number;
  referComment: string;
  referInstant: boolean;
  user: string;
  userAmount: number;
  userComment: string;
  userId: string;
  createdAt: string;
}

export default function ViewCustomPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: customData, isLoading } = useQuery({
    queryKey: ["custom-amounts"],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/custom`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${apiConfig.baseUrl}/delete/custom-amount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success("Deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["custom-amounts"] });
      } else {
        toast.error(data.msg || "Failed to delete");
      }
    },
    onError: () => {
      toast.error("An error occurred");
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await authFetch(`${apiConfig.baseUrl}/delete/custom-amount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: ids }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success(`Deleted ${selectedIds.size} item(s)!`);
        setSelectedIds(new Set());
        queryClient.invalidateQueries({ queryKey: ["custom-amounts"] });
      } else {
        toast.error(data.msg || "Failed to delete");
      }
    },
    onError: () => {
      toast.error("An error occurred");
    },
  });

  const allData: CustomAmount[] = customData?.list || [];

  const filteredData = allData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.number?.toLowerCase().includes(query) ||
      item.name?.toLowerCase().includes(query) ||
      item.event?.toLowerCase().includes(query)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField as keyof CustomAmount] || "";
    const bVal = b[sortField as keyof CustomAmount] || "";
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((item) => item._id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const stats = {
    total: customData?.count || allData.length,
    totalRefer: allData.reduce(
      (sum, item) => sum + (Number(item.referAmount) || 0),
      0,
    ),
    totalUser: allData.reduce(
      (sum, item) => sum + (Number(item.userAmount) || 0),
      0,
    ),
  };

  const SortHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="-ml-4 h-8 px-2"
    >
      {children}
      <ArrowUpDown
        className={`ml-2 h-4 w-4 ${sortField === field ? "text-primary" : ""}`}
      />
    </Button>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            View Custom Amounts
          </h1>
          <p className="text-muted-foreground">
            Manage custom payment configurations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Custom
                </p>
                <p className="text-2xl font-bold">
                  {stats.total.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Refer Total
                </p>
                <p className="text-2xl font-bold">
                  ₹{stats.totalRefer.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User Total
                </p>
                <p className="text-2xl font-bold">
                  ₹{stats.totalUser.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  This Page
                </p>
                <p className="text-2xl font-bold">{paginatedData.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Custom Amounts List
              </CardTitle>
              <CardDescription>
                {filteredData.length} custom amount(s) found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    deleteSelectedMutation.mutate(Array.from(selectedIds))
                  }
                  disabled={deleteSelectedMutation.isPending}
                  className="gap-2"
                >
                  {deleteSelectedMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
              <Link href="/dashboard/customAmount">
                <Button
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" />
                  Add New
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, campaign, or event..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 rounded-lg"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paginatedData.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === paginatedData.length &&
                          paginatedData.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-input"
                      />
                    </TableHead>
                    <TableHead>
                      <SortHeader field="number">Number</SortHeader>
                    </TableHead>
                    <TableHead>
                      <SortHeader field="name">Campaign</SortHeader>
                    </TableHead>
                    <TableHead>
                      <SortHeader field="event">Event</SortHeader>
                    </TableHead>
                    <TableHead className="text-right">
                      <SortHeader field="userAmount">User</SortHeader>
                    </TableHead>
                    <TableHead className="text-right">
                      <SortHeader field="referAmount">Refer</SortHeader>
                    </TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="w-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow
                      key={item._id}
                      className={`hover:bg-muted/30 transition-colors ${selectedIds.has(item._id) ? "bg-primary/5" : ""}`}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item._id)}
                          onChange={() => toggleSelectItem(item._id)}
                          className="rounded border-input"
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        {item.number || "-"}
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[150px] truncate"
                          title={item.name}
                        >
                          {item.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {item.event || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{Number(item.userAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        ₹{Number(item.referAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.referInstant ? "default" : "outline"}
                          className="capitalize"
                        >
                          {item.referInstant ? "Instant" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(item._id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No Custom Amounts Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first custom amount"}
              </p>
              <Link href="/dashboard/customAmount">
                <Button className="mt-4 gap-2 bg-violet-600 hover:bg-violet-700">
                  <Sparkles className="h-4 w-4" />
                  Create Custom Amount
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {sortedData.length > rowsPerPage && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, sortedData.length)} of{" "}
                {sortedData.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                      }
                      if (currentPage > totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      }
                    }
                    if (pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

   
    </div>
  );
}
