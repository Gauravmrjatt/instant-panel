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
} from "lucide-react";

export default function CheckReferPage() {
  const router = useRouter();
  const [offerId, setOfferId] = useState("");
  const [number, setNumber] = useState("");
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
  const endpointUrl = `${baseUrl}/api/v1/checkRefer/${apiKey}/{offerid}?number={number}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleTest = async () => {
    if (!offerId || !number) {
      toast.error("Please enter both Offer ID and Number");
      return;
    }
    setIsLoading(true);
    try {
      const res = await authFetch(`${apiConfig.baseUrl}/api/checkRefer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerid: offerId, number }),
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
              Refer Check API
            </h1>
            <p className="text-muted-foreground">
              Dashboard / <span className="text-foreground">Api</span> / Refer
              Check
            </p>
          </div>
        </div>
      </div>

      {/* API Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Endpoint Card */}
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

        {/* API Key Card */}
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
                Required query parameters for the API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">offerid</Label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code className="text-sm">string</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Campaign/Offer ID to check refers for
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">number</Label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code className="text-sm">string</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number to check refer details
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
              <Label>Offer ID</Label>
              <Input
                placeholder="Enter offer ID"
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Number</Label>
              <Input
                placeholder="Enter phone number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleTest} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Test API
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
                        <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {result.msg}
                      </span>
                    </div>
                    {result.data && (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 font-medium">
                                Field
                              </th>
                              <th className="text-left p-3 font-medium">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.map((item: any, idx: number) => (
                              <tr key={idx} className="border-t">
                                <td className="p-3 text-muted-foreground">
                                  Refer #{idx + 1}
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <p>
                                      <strong>User:</strong> {item.user}
                                    </p>
                                    <p>
                                      <strong>Refer:</strong> {item.refer}
                                    </p>
                                    <p>
                                      <strong>Amount:</strong> ₹
                                      {item.userAmount} / ₹{item.referAmount}
                                    </p>
                                    <p>
                                      <strong>Status:</strong>{" "}
                                      <Badge variant="outline">
                                        {item.status}
                                      </Badge>
                                    </p>
                                    <p>
                                      <strong>Payment:</strong>{" "}
                                      {item.paymentStatus}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
              <TabsTrigger value="success">Valid Request</TabsTrigger>
              <TabsTrigger value="error">Invalid Request</TabsTrigger>
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
  "msg": "Refer Details found",
  "count": 20,
  "clicks": 20,
  "data": [
    {
      "user": 9876543210,
      "refer": 9876543210,
      "userAmount": 10,
      "referAmount": 10,
      "event": "event_name",
      "status": "APPROVE | PENDING | REJECTED",
      "click": "click_id",
      "paymentStatus": "Payment status",
      "payMessage": "Payment Message",
      "createdAt": "2024-01-01T00:00:00.000Z"
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
  "msg": "Error Details"
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
