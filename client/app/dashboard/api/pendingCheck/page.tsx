"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiConfig, authFetch } from "@/lib/config";
import { toast, Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  XCircle,
  Key,
  Globe,
  Code,
  FileText,
  Hash,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";

export default function PendingCheckPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    campaignId: "",
    phone: "",
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: postback } = useQuery({
    queryKey: ["postback"],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/postback`);
      return res.json();
    },
  });

  const apiKey = postback?.key || "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const endpointUrl = `${baseUrl}/api/v1/pendingCheck/${apiKey}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleTest = async () => {
    if (!formData.campaignId || !formData.phone) {
      toast.error("Please fill in Campaign ID and Phone number");
      return;
    }
    setIsLoading(true);
    try {
      const res = await authFetch(`${apiConfig.baseUrl}/api/pendingCheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      toast.error("Failed to test API");
    } finally {
      setIsLoading(false);
    }
  };

  if (postback === undefined) {
    return (
      <div className="space-y-6  w-full animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
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
            <h1 className="text-3xl font-bold tracking-tight">
              Check Pending API
            </h1>
            <p className="text-muted-foreground">
              Dashboard / <span className="text-foreground">Api</span> / Check
              Pending
            </p>
          </div>
        </div>
      </div>

      {/* API Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              API Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <code className="text-sm break-all">POST {endpointUrl}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => copyToClipboard(endpointUrl)}
            >
              <Copy className="h-4 w-4" />
              Copy Endpoint
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Key className="h-5 w-5 text-amber-500" />
              </div>
              API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <code className="text-sm font-mono break-all">
                {apiKey || "Not Available"}
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                From Postback Key
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parameters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Hash className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle>Parameters</CardTitle>
              <CardDescription>
                Request body parameters for the API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                campaignId <span className="text-destructive">*</span>
              </Label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code className="text-sm">string</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Campaign ID to check
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                phone <span className="text-destructive">*</span>
              </Label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code className="text-sm">string</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number to check
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test API Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Code className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle>Test API</CardTitle>
              <CardDescription>
                Test the API with your parameters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Campaign ID <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter campaign ID"
                value={formData.campaignId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, campaignId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <Button onClick={handleTest} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Check Pending
              </>
            )}
          </Button>

          {result && (
            <div className="mt-4">
              <Tabs defaultValue="response" className="w-full">
                <TabsList>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                </TabsList>
                <TabsContent value="response">
                  <div className="bg-muted p-4 rounded-lg mt-2">
                    <pre className="text-sm whitespace-pre-wrap break-all">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="formatted">
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center gap-2">
                      {result.status ? (
                        <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Pending Found
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          No Pending
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {result.msg}
                      </span>
                    </div>
                    {result.data && (
                      <div className="grid gap-4 md:grid-cols-2 border rounded-lg p-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            User Amount
                          </p>
                          <p className="font-medium text-lg">
                            ₹{result.data.userAmount || 0}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Refer Amount
                          </p>
                          <p className="font-medium text-lg text-emerald-600">
                            ₹{result.data.referAmount || 0}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Event</p>
                          <Badge variant="secondary">
                            {result.data.event || "-"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <Badge
                            variant={
                              result.data.status === "PENDING"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {result.data.status || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Documentation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>API Response</CardTitle>
              <CardDescription>Expected response formats</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="success" className="w-full">
            <TabsList>
              <TabsTrigger value="success">Pending Found</TabsTrigger>
              <TabsTrigger value="error">No Pending</TabsTrigger>
            </TabsList>
            <TabsContent value="success">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600">
                    Pending Found Response
                  </span>
                </div>
                <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                  {`{
  "status": true,
  "msg": "Pending payment found",
  "data": {
    "userAmount": 100,
    "referAmount": 50,
    "event": "event_name",
    "status": "PENDING"
  }
}`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="error">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    No Pending Response
                  </span>
                </div>
                <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                  {`{
  "status": false,
  "msg": "No pending payment found"
}`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}
