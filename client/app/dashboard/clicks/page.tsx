"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { searchClicks, ClickData } from "@/hooks/useClicks";
import {toast} from "sonner";
import {
  Search,
  ArrowLeft,
  Copy,
  Check,
  MousePointerClick,
  Smartphone,
  Monitor,
  Globe,
  Loader2,
  HelpCircle,
  FileText,
  Sparkles,
  BarChart3,
  Clock,
  User,
  MapPin,
  Hash,
} from "lucide-react";

const columns: ColumnDef<ClickData>[] = [
  {
    accessorKey: "click",
    header: "Click ID",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
          {row.original.click}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => navigator.clipboard.writeText(row.original.click)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="font-mono text-sm">{row.original.user}</span>
      </div>
    ),
  },
  {
    accessorKey: "refer",
    header: "Referrer",
    cell: ({ row }) => (
      <div>
        {row.original.refer ? (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.refer}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Direct</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "number",
    header: "Phone",
    cell: ({ row }) => <span className="font-mono">{row.original.number}</span>,
  },
  {
    accessorKey: "ip",
    header: "IP Address",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono text-xs">{row.original.ip}</span>
      </div>
    ),
  },
  {
    accessorKey: "device",
    header: "Device",
    cell: ({ row }) => {
      const device = row.original.device;
      const isMobile =
        device.device?.type === "smartphone" ||
        device.os?.family?.toLowerCase().includes("android") ||
        device.os?.family?.toLowerCase().includes("ios");

      return (
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Monitor className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="text-xs">
            <p className="font-medium">{device.os?.name || "Unknown"}</p>
            <p className="text-muted-foreground">
              {device.client?.name || "Browser"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm">
          <p className="font-medium">{date.toLocaleDateString()}</p>
          <p className="text-muted-foreground text-xs">
            {date.toLocaleTimeString()}
          </p>
        </div>
      );
    },
  },
];

function explode(str: string, delimiters: string[]) {
  let ready = str;
  for (const d of delimiters) {
    ready = ready.split(d).join(",");
  }
  const arr = ready.split(",");
  return arr.filter((value) => value !== "" && value.trim() !== "");
}

function SearchStats({ rows }: { rows: ClickData[] }) {
  const mobileUsers = rows.filter(
    (r) =>
      r.device?.device?.type === "smartphone" ||
      r.device?.os?.family?.toLowerCase().includes("android"),
  ).length;

  const desktopUsers = rows.length - mobileUsers;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rows.length}</p>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Smartphone className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">
                {mobileUsers}
              </p>
              <p className="text-xs text-muted-foreground">Mobile</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Monitor className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{desktopUsers}</p>
              <p className="text-xs text-muted-foreground">Desktop</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Globe className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rows.length}</p>
              <p className="text-xs text-muted-foreground">Unique IPs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClicksPage() {
  const [clickIdInput, setClickIdInput] = useState("");
  const [clickIds, setClickIds] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [rows, setRows] = useState<ClickData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const searchMutation = useMutation({
    mutationFn: searchClicks,
    onSuccess: (data) => {
      setRows(data.clickData);
      setShowResults(true);
      toast.success(data.msg);
    },
    onError: () => {
      toast.error("Failed to search clicks");
    },
  });

  const handleSearch = () => {
    if (clickIds.length === 0) {
      toast.error("Enter a Click ID");
      return;
    }
    searchMutation.mutate(clickIds);
  };

  const handleInputChange = (value: string) => {
    setClickIdInput(value);
    const ids = explode(value, [",", ".", "|", ":", "\r\n", "\n"]);
    setClickIds(ids);
  };

  const goBack = () => {
    setShowResults(false);
    setRows([]);
    setClickIdInput("");
    setClickIds([]);
  };

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6  w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MousePointerClick className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Click Details</h1>
            <p className="text-muted-foreground">
              Search and track individual click information
            </p>
          </div>
        </div>
      </div>

      {showResults ? (
        <div className="space-y-6">
          {/* Back Button & Title */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              New Search
            </Button>
            <p className="text-sm text-muted-foreground">
              Found{" "}
              <span className="font-semibold text-foreground">
                {rows.length}
              </span>{" "}
              clicks
            </p>
          </div>

          {/* Stats Cards */}
          <SearchStats rows={rows} />

          {/* Results Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Search Results</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-muted/50">
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="font-semibold whitespace-nowrap"
                            >
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
                              animationDelay: `${index * 20}ms`,
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className="whitespace-nowrap"
                              >
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
                                No results found
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Search Click IDs</CardTitle>
                </div>
                <CardDescription>
                  Enter one or more click IDs to search for details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Click IDs
                    <Badge variant="secondary">{clickIds.length} entered</Badge>
                  </label>
                  <textarea
                    ref={inputRef}
                    className="flex min-h-[150px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"
                    placeholder={`Enter Click IDs here...&#10;&#10;Supported separators:&#10;• Comma (,)  • Period (.)  • Colon (:)&#10;• Vertical bar (|)  • New line`}
                    value={clickIdInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate multiple IDs with any of these characters:{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      , . | :
                    </code>
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      {clickIds.length} Click ID
                      {clickIds.length !== 1 ? "s" : ""} ready to search
                    </span>
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={searchMutation.isPending || clickIds.length === 0}
                    className="gap-2"
                  >
                    {searchMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Search Clicks
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="mt-4 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      Where to find Click IDs?
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click IDs are available in your campaign reports and can
                      be exported from the Reports page. Each click is assigned
                      a unique identifier when recorded.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Card */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">How to Search</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Enter Click ID(s)</p>
                      <p className="text-xs text-muted-foreground">
                        Type or paste the click ID you want to search
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Separate Multiple IDs
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use any separator: , . | : or new lines
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Click Search</p>
                      <p className="text-xs text-muted-foreground">
                        Wait for the results to load
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Supported Separators
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Comma (,)",
                      "Period (.)",
                      "Colon (:)",
                      "Pipe (|)",
                      "Tab",
                      "New Line",
                    ].map((sep) => (
                      <div
                        key={sep}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {sep}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Results are fetched in real-time from your data</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}


    </div>
  );
}
