"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  IndianRupee,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Bell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiConfig, authFetch } from "@/lib/config";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CampaignsChart } from "@/components/dashboard/campaigns-chart";
import { ClicksChart } from "@/components/dashboard/clicks-chart";
import { ConversionCard } from "@/components/dashboard/conversion-card";
import { PaymentsChart } from "@/components/dashboard/payments-chart";
import { TopUsers } from "@/components/dashboard/top-users";

interface DashboardData {
  loading?: boolean;
  code?: number;
  status?: boolean;
  leads?: {
    all: number;
    today: number;
    yesterday: number;
    grow: number;
  };
  payments?: {
    today: number;
    yesterday: number;
    all: number;
    grow: number;
  };
  allClicks?: number;
  topCamps?: Array<{ name: string; count: number; offerID: number }>;
  topUsers?: Array<{
    _id: string;
    username: string;
    totalAmount: number;
    paymentCount: number;
  }>;
  camp?: number;
  totalClicks?: number;
  dashText?: string;
  sevenLeads?: {
    all: number[];
    approved: number[];
    rejected: number[];
    pending: number[];
  };
  clicks?: number[];
  paymentData?: number[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

function GreetingHeader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (!mounted) return <Skeleton className="h-8 w-64" />;

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">
          Here&apos;s your performance overview for today
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Last 7 Days
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
            3
          </span>
        </Button>
      </div>
    </div>
  );
}

function PlanExpiredCard() {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Plan Expired
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your subscription has expired. Please renew to continue accessing
              all features.
            </p>
          </div>
          {/* <Button className="ml-auto" size="sm">
            Renew Now
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (dash?.code === 0) {
    return (
      <div className="space-y-6 p-6">
        <PlanExpiredCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <GreetingHeader />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={dash?.leads?.all || 0}
          icon={Users}
          
          subtitle="All time"
          variant="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Today's Leads"
          value={dash?.leads?.today || 0}
          icon={TrendingUp}
          trend={dash?.leads?.grow}
          subtitle={`${dash?.leads?.yesterday?.toLocaleString() || 0} yesterday`}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Today's Payments"
          value={dash?.payments?.today || 0}
          icon={IndianRupee}
          trend={dash?.payments?.grow}
          subtitle="Revenue"
          variant="warning"
          isCurrency
          isLoading={isLoading}
        />
        <StatCard
          title="Total Payments"
          value={dash?.payments?.all || 0}
          icon={IndianRupee}
          subtitle="All time earnings"
          isCurrency
          isLoading={isLoading}
        />
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart
          data={{
            all: dash?.sevenLeads?.all || [],
            approved: dash?.sevenLeads?.approved || [],
            rejected: dash?.sevenLeads?.rejected || [],
            pending: dash?.sevenLeads?.pending || [],
          }}
          isLoading={isLoading}
        />
        <CampaignsChart
          camps={dash?.topCamps || []}
          totalCamps={dash?.camp || 0}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ClicksChart
          data={dash?.clicks || []}
          totalClicks={dash?.totalClicks || 0}
          isLoading={isLoading}
        />
        <ConversionCard
          totalClicks={dash?.allClicks || 0}
          totalLeads={dash?.leads?.all || 0}
          todayLeads={dash?.leads?.today || 0}
          isLoading={isLoading}
        />
        <div className="lg:col-span-1">
          <TopUsers
            users={
              dash?.topUsers?.map((u) => ({
                _id: u._id,
                username: u._id.split("@")[0],
                totalAmount: u.totalAmount,
                paymentCount: u.paymentCount,
              })) || []
            }
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentsChart
          data={dash?.paymentData || []}
          todayPayments={dash?.payments?.today || 0}
          yesterdayPayments={dash?.payments?.yesterday || 0}
          grow={dash?.payments?.grow || 0}
          isLoading={isLoading}
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Campaign performance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  Active Campaigns
                </p>
                <p className="text-2xl font-bold">{dash?.camp || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">
                  {(dash?.allClicks || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {dash?.allClicks && dash?.allClicks > 0 && dash?.leads?.all
                    ? ((dash.leads.all / dash.allClicks) * 100).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-sm text-muted-foreground">Avg Lead Value</p>
                <p className="text-2xl font-bold">
                  {dash?.leads?.all &&
                  dash?.payments?.all &&
                  dash?.leads?.all > 0
                    ? `₹${Math.round(dash?.payments?.all / dash?.leads?.all)}`
                    : "₹0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
