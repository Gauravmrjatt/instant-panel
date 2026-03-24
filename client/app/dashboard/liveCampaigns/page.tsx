"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {toast} from "sonner";
import {
  SearchIcon,
  Plus,
  LayoutGrid,
  List,
  TrendingUp,
  RefreshCw,
  Crown,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react";
import { useCampaigns, type Campaign } from "@/hooks/useCampaigns";
import { authFetch } from "@/lib/config";
import { apiConfig } from "@/lib/config";

import { CampaignStats } from "@/components/campaigns/campaign-stats";
import { CampaignDrawer } from "@/components/campaigns/campaign-drawer";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";

type ViewMode = "table" | "grid";
type FilterTab = "all" | "active" | "pending";

export default function LiveCampaignsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useCampaigns();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const campaigns = data?.data || [];

  const deleteCampaign = async (id: string) => {
    try {
      const res = await authFetch(
        `${apiConfig.baseUrl}/delete/campaign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: id }),
        },
      );
      const result = await res.json();
      if (result.status) {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        toast.success("Campaign deleted successfully");
      } else {
        toast.error(result.msg || "Failed to delete campaign");
      }
    } catch {
      toast.error("Failed to delete campaign");
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDrawerOpen(true);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterTab === "all") return true;
    if (filterTab === "active") {
      return (campaign.events?.length || 0) > 0;
    }
    if (filterTab === "pending") {
      return (campaign.events?.length || 0) === 0;
    }
    return true;
  });

  const activeCount = campaigns.filter(
    (c) => (c.events?.length || 0) > 0,
  ).length;
  const pendingCount = campaigns.filter(
    (c) => (c.events?.length || 0) === 0,
  ).length;

  return (
    <div className="space-y-6  w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Live Campaigns
              </h1>
              <p className="text-muted-foreground">
                Manage and monitor your active campaigns
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="relative"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            render={<Link href="/dashboard/campaigns" />}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <CampaignStats campaigns={campaigns} isLoading={isLoading} />

      {/* Insights Banner */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Performance Insights</h3>
                <p className="text-sm text-muted-foreground">
                  {activeCount} of {campaigns.length} campaigns are actively
                  generating leads
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaigns.length > 0
                    ? ((activeCount / campaigns.length) * 100).toFixed(0)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Active Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {campaigns.reduce(
                    (acc, c) => acc + (c.events?.length || 0),
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  {activeCount}
                </div>
                <p className="text-xs text-muted-foreground">Configured</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={filterTab}
          onValueChange={(v) => setFilterTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {campaigns.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Active
              <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {activeCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Pending
              <span className="ml-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                {pendingCount}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 w-[200px] md:w-[300px]"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign Table */}
      <CampaignsTable
        data={filteredCampaigns}
        isLoading={isLoading}
        onView={handleViewCampaign}
        onDelete={deleteCampaign}
        searchQuery={searchQuery}
      />

      {/* Campaign Drawer */}
      <CampaignDrawer
        campaign={selectedCampaign}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDelete={deleteCampaign}
      />

   
    </div>
  );
}
