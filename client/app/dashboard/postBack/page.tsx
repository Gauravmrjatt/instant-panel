"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { apiConfig, authFetch } from "@/lib/config";
import { toast } from "sonner";
import {
  Copy,
  RefreshCw,
  Trash2,
  Globe,
  Key,
  Link2,
  Code,
  Zap,
  CheckCircle2,
  XCircle,
  BookOpen,
  Clipboard,
  ArrowLeft,
} from "lucide-react";

export default function PostBackPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const { data: postback, isLoading } = useQuery({
    queryKey: ["postback"],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/postback`);
      return res.json();
    },
  });

  const togglePostback = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await authFetch(`${apiConfig.baseUrl}/edit/postback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status) {
        toast.success(
          data.msg ||
          (data.isEnabled ? "Global postback enabled!" : "Global postback disabled!")
        );
        queryClient.invalidateQueries({ queryKey: ["postback"] });
      } else {
        toast.error(data.msg || "Failed to update postback");
      }
    },
    onError: () => {
      toast.error("Failed to update postback");
    },
  });

  const resetPostback = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/update/postback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status) {
        toast.success("Postback API key reset successfully!");
        queryClient.invalidateQueries({ queryKey: ["postback"] });
        setResetConfirmOpen(false);
        setConfirmText("");
      } else {
        toast.error(data.msg || "Failed to reset postback");
      }
    },
    onError: () => {
      toast.error("Failed to reset postback");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 w-full animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isResetConfirmValid = confirmText === "RESET";
  const isEnabled = postback?.isEnabled ?? false;

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Postback Settings
              </h1>
              <Button
                variant={isEnabled ? "default" : "secondary"}
                size="sm"
                className="gap-1"
              >
                {isEnabled ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </>
                )}
              </Button>
            </div>
            <p className="text-muted-foreground">
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>{" "}
              / Postback
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
                  Postback URL
                </p>
                <p className="text-sm font-mono mt-1 truncate max-w-[200px]">
                  {postback?.url || "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  API Key
                </p>
                <p className="text-sm font-mono mt-1 truncate max-w-[200px]">
                  {postback?.key || "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Key className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Postback URL Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Postback URL</CardTitle>
                  <CardDescription>
                    Copy this URL to your tracking system
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="postback-enabled"
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    togglePostback.mutate(checked as boolean)
                  }
                  disabled={togglePostback.isPending}
                />
                <label
                  htmlFor="postback-enabled"
                  className="text-sm font-normal cursor-pointer"
                >
                  Enable
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <code className="block text-sm break-all text-foreground/80">
                {postback?.url || "N/A"}
              </code>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => copyToClipboard(postback?.url || "")}
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
          </CardContent>
        </Card>

        {/* API Key Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Key className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  Your unique API key for postback authentication
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <code className="block text-sm font-mono break-all text-foreground/80">
                {postback?.key || "N/A"}
              </code>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => copyToClipboard(postback?.key || "")}
              >
                <Copy className="h-4 w-4" />
                Copy Key
              </Button>
              <Dialog
                open={resetConfirmOpen}
                onOpenChange={setResetConfirmOpen}
              >
                <DialogTrigger>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Postback API Key</DialogTitle>
                    <DialogDescription>
                      This will generate a new API key. Update your integrations
                      with the new key. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="confirm-reset"
                        className="text-sm font-medium"
                      >
                        Type <span className="font-mono font-bold">RESET</span>{" "}
                        to confirm
                      </label>
                      <Input
                        id="confirm-reset"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type RESET"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResetConfirmOpen(false);
                        setConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={!isResetConfirmValid || resetPostback.isPending}
                      onClick={() => resetPostback.mutate()}
                    >
                      {resetPostback.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset Key
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Learn how to use the postback URL
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">1. Copy URL</h4>
                <p className="text-sm text-muted-foreground">
                  Copy your unique postback URL
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">2. Auto Triggers</h4>
                <p className="text-sm text-muted-foreground">
                  Postbacks on lead status change
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Code className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">3. Track Data</h4>
                <p className="text-sm text-muted-foreground">
                  Receive conversion data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Code className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle>URL Parameters</CardTitle>
              <CardDescription>
                Parameters passed in the postback request
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <code className="text-sm font-mono text-emerald-500">eventname</code>
              <span className="text-sm text-muted-foreground">
                - event2 | event3 | event4
              </span>
            </div>
            <Separator />
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <code className="text-sm font-mono text-amber-500">click_id</code>
              <span className="text-sm text-muted-foreground">
                - Unique click identifier
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Section */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clipboard className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Example Request</CardTitle>
              <CardDescription>
                Sample GET request to the postback URL
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <p className="text-muted-foreground mb-2">GET Request:</p>
            <p className="break-all">
              {postback?.url || "N/A"}
              <span className="text-primary">/{"{{key}}"}</span>
              ?click_id=abc123&status=approved&payout=10
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Expected response: 200 OK</span>
          </div>
        </CardContent>
      </Card> */}


    </div>
  );
}
