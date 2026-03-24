"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiConfig, authFetch } from "@/lib/config";
import {toast} from "sonner";
import {
  ArrowLeft,
  ShieldAlert,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function BanUpiPage() {
  const router = useRouter();
  const [newUpi, setNewUpi] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [unbanConfirmOpen, setUnbanConfirmOpen] = useState(false);
  const [upiToUnban, setUpiToUnban] = useState("");
  const queryClient = useQueryClient();

  const { data: bannedUpi, isLoading } = useQuery({
    queryKey: ["banned-number"],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/number`);
      return res.json();
    },
  });

  const banMutation = useMutation({
    mutationFn: async (number: string) => {
      const res = await authFetch(`${apiConfig.baseUrl}/ban/number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success("Number banned successfully!");
        queryClient.invalidateQueries({ queryKey: ["banned-number"] });
        setNewUpi("");
      } else {
        toast.error(data.msg || "Failed to ban number");
      }
    },
    onError: () => {
      toast.error("Failed to ban number");
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (number: string) => {
      const res = await authFetch(`${apiConfig.baseUrl}/ban/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: number }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success("Number unbanned successfully!");
        queryClient.invalidateQueries({ queryKey: ["banned-number"] });
        setUnbanConfirmOpen(false);
        setUpiToUnban("");
      } else {
        toast.error(data.msg || "Failed to unban number");
      }
    },
    onError: () => {
      toast.error("Failed to unban number");
    },
  });

  const handleUnbanClick = (number: string) => {
    setUpiToUnban(number);
    setUnbanConfirmOpen(true);
  };

  const filteredBans =
    bannedUpi?.list?.bans?.filter((item: any) =>
      item.number?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6  w-full animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 ">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ban UPI</h1>
            <p className="text-muted-foreground">
              Manage blocked UPI IDs for fraud prevention
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Banned
                </p>
                <p className="text-2xl font-bold">{bannedUpi?.count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Protection Status
                </p>
                <p className="text-2xl font-bold text-emerald-500">Active</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New UPI Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Add Banned UPI</CardTitle>
              <CardDescription>
                Enter a UPI ID to block transactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter UPI ID to ban (e.g., user@upi)"
                value={newUpi}
                onChange={(e) => setNewUpi(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => banMutation.mutate(newUpi)}
              disabled={!newUpi || banMutation.isPending}
              className="gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Ban UPI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Banned List Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Banned UPI List</CardTitle>
                <CardDescription>All blocked UPI IDs</CardDescription>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search UPI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No Banned UPI Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No results match your search"
                  : "Add UPI IDs to ban them from transactions"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">UPI ID</TableHead>
                    <TableHead className="w-[30%]">Date Banned</TableHead>
                    <TableHead className="w-[20%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBans.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-mono">{item.number}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.banDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Dialog
                          open={unbanConfirmOpen}
                          onOpenChange={setUnbanConfirmOpen}
                        >
                          <DialogTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              onClick={() => handleUnbanClick(item.number)}
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Unban
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Unban Number
                              </DialogTitle>
                              <DialogDescription>
                                Are you sure you want to unban{" "}
                                <strong>{upiToUnban}</strong>? This will allow
                                transactions with this number again.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setUnbanConfirmOpen(false);
                                  setUpiToUnban("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                onClick={() => unbanMutation.mutate(item._id)}
                                disabled={unbanMutation.isPending}
                              >
                                {unbanMutation.isPending ? (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                                    Unbanning...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Unban Number
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
