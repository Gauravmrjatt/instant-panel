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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCampaignsList,
  usePendingPayments,
  usePayAllPending,
} from "@/hooks/usePending";
import { authFetch, apiConfig } from "@/lib/config";
import {toast} from "sonner";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  FileText,
  RefreshCw,
  Wallet,
  Users,
  IndianRupee,
  Send,
  ArrowRight,
  Copy,
  Check,
  Info,
} from "lucide-react";

interface PendingPayment {
  _id: string;
  total: number;
}

export default function PendingPaymentsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [comment, setComment] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading: loadingCampaigns } = useCampaignsList();
  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch,
  } = usePendingPayments(selectedCampaign);
  const payAllMutation = usePayAllPending();

  const pendingItems: PendingPayment[] = pendingData?.data || [];

  const stats = {
    total: pendingItems.length,
    totalAmount: pendingItems.reduce((sum, item) => sum + (item.total || 0), 0),
  };

  const handleSelectAll = () => {
    if (selectedItems.size === pendingItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(pendingItems.map((item) => item._id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectedTotal = pendingItems
    .filter((item) => selectedItems.has(item._id))
    .reduce((sum, item) => sum + (item.total || 0), 0);

  const payMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await authFetch(
        `${apiConfig.baseUrl}/api/update/pendings/${userId}?comment=${comment || ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: "approved" }),
        },
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status) {
        toast.success("Payment processed successfully");
        refetch();
      } else {
        toast.error(data.msg || "Failed to process payment");
      }
    },
    onError: () => {
      toast.error("An error occurred");
    },
  });

  const handlePayAll = () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign first");
      return;
    }

    toast.promise(
      payAllMutation.mutateAsync({ campaignId: selectedCampaign, comment }),
      {
        loading: "Processing all payments...",
        success: (data) => {
          refetch();
          setSelectedItems(new Set());
          return data.msg || "All payments processed successfully!";
        },
        error: (error) => error.message || "Failed to process payments",
      },
    );
  };

  const handlePaySelected = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one payment");
      return;
    }

    toast.promise(
      Promise.all(
        Array.from(selectedItems).map((userId) =>
          authFetch(
            `${apiConfig.baseUrl}/api/update/pendings/${userId}?comment=${comment || ""}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value: "approved" }),
            },
          ).then((res) => res.json()),
        ),
      ),
      {
        loading: `Processing ${selectedItems.size} payment(s)...`,
        success: () => {
          refetch();
          setSelectedItems(new Set());
          return `${selectedItems.size} payment(s) processed successfully!`;
        },
        error: () => "Failed to process some payments",
      },
    );
  };

  const handleCopyUPI = (upi: string) => {
    navigator.clipboard.writeText(upi);
    toast.success("UPI ID copied!");
  };

  const parseUPI = (upi: string) => {
    const parts = upi.split("@");
    if (parts.length >= 2) {
      return {
        user: parts[0],
        provider: "@" + parts.slice(1).join("@"),
      };
    }
    return { user: upi, provider: "" };
  };

  const getProviderColor = (provider: string) => {
    const providerLower = provider.toLowerCase();
    if (providerLower.includes("ybl") || providerLower.includes("upi"))
      return "bg-blue-500";
    if (providerLower.includes("fam")) return "bg-purple-500";
    if (providerLower.includes("gpay")) return "bg-green-500";
    if (providerLower.includes("phonepe")) return "bg-pink-500";
    if (providerLower.includes("paytm")) return "bg-cyan-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <Wallet className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pending Payments
            </h1>
            <p className="text-muted-foreground">
              Process and manage user payment requests
            </p>
          </div>
        </div>
        {selectedCampaign && (
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* Campaign Selector */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Select Campaign</CardTitle>
              <CardDescription>
                Choose a campaign to view pending payment requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCampaigns ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <Select
              value={selectedCampaign}
              onValueChange={(value) => {
                setSelectedCampaign(value || "");
                setSelectedItems(new Set());
              }}
            >
              <SelectTrigger className="w-full h-12 rounded-lg">
                <SelectValue placeholder="Select a campaign to view pending payments" />
              </SelectTrigger>
              <SelectContent>
                {campaigns?.data.map((campaign) => (
                  <SelectItem key={campaign._id} value={campaign._id}>
                    {campaign.name} (ID: {campaign.offerID})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {selectedCampaign && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Requests
                  </p>
                  <p className="text-3xl font-bold">{stats.total}</p>
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
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold">
                    ₹{stats.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <Send className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Selected Amount
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ₹{selectedTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Payments Table */}
      {selectedCampaign && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Payment Requests</CardTitle>
                  <CardDescription>
                    {stats.total} request(s) awaiting processing
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Add a note for payments..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="max-w-xs rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handlePaySelected}
                    disabled={selectedItems.size === 0 || payMutation.isPending}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                    Pay Selected ({selectedItems.size})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePayAll}
                    disabled={stats.total === 0 || payAllMutation.isPending}
                    className="gap-2"
                  >
                    {payAllMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    Pay All
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingPending ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingItems.length > 0 ? (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.size === pendingItems.length &&
                            pendingItems.length > 0
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>UPI ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingItems.map((item) => {
                      const { user, provider } = parseUPI(item._id);
                      return (
                        <TableRow
                          key={item._id}
                          className="hover:bg-muted/30 transition-colors"
                          data-selected={selectedItems.has(item._id)}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg ${getProviderColor(provider)} flex items-center justify-center text-white text-xs font-bold uppercase`}
                              >
                                {provider.replace("@", "").slice(0, 2)}
                              </div>
                              <div>
                                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                  {item._id}
                                </code>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleCopyUPI(item._id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{user}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-lg">
                              ₹{item.total.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg m-6">
                <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-600">
                  All Caught Up!
                </h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">
                  No pending payments for this campaign. All requests have been
                  processed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      {!selectedCampaign && (
        <Card className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  How Pending Payments Work
                </h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      1
                    </div>
                    <p>
                      Select a campaign from the dropdown above to view pending
                      payments
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      2
                    </div>
                    <p>Review the list of UPI IDs with pending amounts</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      3
                    </div>
                    <p>
                      Click "Pay Selected" to process individual payments or
                      "Pay All" to process everyone at once
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
