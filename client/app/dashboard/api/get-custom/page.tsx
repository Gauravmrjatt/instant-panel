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
  Diamond,
} from "lucide-react";

export default function GetCustomPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: postback } = useQuery({
    queryKey: ["postback"],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/postback`);
      return res.json();
    },
  });

  const {
    data: customData,
    isLoading: isLoadingData,
    refetch,
  } = useQuery({
    queryKey: ["api-custom"],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/api/get-custom`);
      return res.json();
    },
  });

  const apiKey = postback?.key || "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const endpointUrl = `${baseUrl}/api/v1/getCustom/${apiKey}/{number}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleTest = async () => {
    if (!filter) {
      toast.error("Please enter a phone number");
      return;
    }
    setIsLoading(true);
    try {
      await refetch();
    } catch (error) {
      toast.error("Failed to fetch data");
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
              Get Custom Amount API
            </h1>
            <p className="text-muted-foreground">
              Dashboard / <span className="text-foreground">Api</span> / Get
              Custom Amount
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
              <code className="text-sm break-all">GET {endpointUrl}</code>
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
              <CardDescription>URL parameters for the API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                number <span className="text-destructive">*</span>
              </Label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code className="text-sm">string</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number to get custom amounts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Get Custom Amounts Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Diamond className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle>Custom Amounts Data</CardTitle>
                <CardDescription>
                  View all custom amounts from API
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoadingData}
                className="gap-2"
              >
                {isLoadingData ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : customData ? (
            <Tabs defaultValue="response" className="w-full">
              <TabsList>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
              </TabsList>
              <TabsContent value="response">
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <pre className="text-sm whitespace-pre-wrap break-all">
                    {JSON.stringify(customData, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="formatted">
                <div className="space-y-4 mt-2">
                  {customData.status ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Success
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {customData.msg}
                        </span>
                      </div>
                      {customData.count !== undefined && (
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {customData.count} Custom Amounts
                          </Badge>
                        </div>
                      )}
                      {customData.data &&
                      Array.isArray(customData.data) &&
                      customData.data.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-3 font-medium">
                                  Number
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Campaign
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Event
                                </th>
                                <th className="text-right p-3 font-medium">
                                  User Amount
                                </th>
                                <th className="text-right p-3 font-medium">
                                  Refer Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {customData.data.map((item: any, idx: number) => (
                                <tr key={idx} className="border-t">
                                  <td className="p-3 font-mono">
                                    {item.number || "-"}
                                  </td>
                                  <td className="p-3">{item.name || "-"}</td>
                                  <td className="p-3">
                                    <Badge variant="secondary">
                                      {item.event || "-"}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right font-semibold">
                                    ₹{item.userAmount || 0}
                                  </td>
                                  <td className="p-3 text-right font-semibold text-emerald-600">
                                    ₹{item.referAmount || 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No custom amounts found
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Error
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {customData.msg || "Failed to fetch"}
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Click refresh to load data
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
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
            <TabsContent value="success">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    Success Response
                  </span>
                </div>
                <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                  {`{
  "status": true,
  "msg": "Custom amounts found",
  "count": 5,
  "data": [
    {
      "number": "9876543210",
      "name": "Campaign Name",
      "event": "event_name",
      "userAmount": 150,
      "referAmount": 100
    }
  ]
}`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="error">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Error Response
                  </span>
                </div>
                <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                  {`{
  "status": false,
  "msg": "No custom amounts found"
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
