"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  IconActivityHeartbeat,
  IconChartBar,
  IconChevronRight,
  IconCode,
  IconDatabase,
  IconDiamond,
  IconDotsVertical,
  IconFileText,
  IconFolder,
  IconFolders,
  IconHistory,
  IconHome,
  IconKey,
  IconLock,
  IconLockPassword,
  IconLogout,
  IconNorthStar,
  IconPasswordFingerprint,
  IconSettings,
  IconShieldLock,
  IconUser,
  IconUserCircle,
  IconUserPlus,
  IconWallet,
  IconWebhook,
  IconX,
  IconDeviceMobile,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardTeamSwitcher } from "@/components/dashboard/team-switcher";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/useUser";
import { ListPlus, TableOfContents } from "lucide-react";

interface SubItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  route: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  hasSubItems: boolean;
  subItems?: SubItem[];
  route?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: IconHome,
    hasSubItems: false,
    route: "/dashboard",
  },
  {
    id: "postback",
    label: "Postback",
    icon: IconWebhook,
    hasSubItems: false,
    route: "/dashboard/postBack",
  },

  {
    id: "campaigns",
    label: "Campaigns",
    icon: IconFolders,
    hasSubItems: true,
    subItems: [
      {
        id: "add-campaign",
        label: "Add Campaign",
        icon: IconFolder,
        description: "Create a new campaign",
        route: "/dashboard/campaigns",
      },
      {
        id: "campaigns-list",
        label: "Campaigns",
        icon: IconFileText,
        description: "View all campaigns",
        route: "/dashboard/liveCampaigns",
      },
      {
        id: "reports",
        label: "Reports",
        icon: IconChartBar,
        description: "Campaign reports and analytics",
        route: "/dashboard/reports",
      },
      {
        id: "click-details",
        label: "Click Details",
        icon: IconActivityHeartbeat,
        description: "Click tracking details",
        route: "/dashboard/clicks",
      },
    ],
  },
  {
    id: "payouts",
    label: "Payouts",
    icon: IconWallet,
    hasSubItems: true,
    subItems: [
      {
        id: "pay-to-user",
        label: "Pay to User",
        icon: IconUser,
        description: "Pay amount to user",
        route: "/dashboard/pay-to-user",
      },
      {
        id: "pay-clickid",
        label: "Pay ClickId",
        icon: IconNorthStar,
        description: "Pay by ClickId",
        route: "/dashboard/clickPay",
      },
    ],
  },
  {
    id: "history",
    label: "History",
    icon: IconHistory,
    hasSubItems: true,
    subItems: [
      {
        id: "pending-payments",
        label: "Pending Payments",
        icon: IconClock,
        description: "View pending payments",
        route: "/dashboard/pending",
      },
      {
        id: "payments",
        label: "Payments",
        icon: IconDatabase,
        description: "Payment history",
        route: "/dashboard/payments",
      },
    ],
  },
  {
    id: "api",
    label: "API",
    icon: IconCode,
    hasSubItems: true,
    subItems: [
      {
        id: "check-refer",
        label: "Refer Check",
        icon: IconUserPlus,
        description: "Check referrer",
        route: "/dashboard/api/checkRefer",
      },
      {
        id: "user-check",
        label: "User Check",
        icon: IconUser,
        description: "Check user details",
        route: "/dashboard/api/user",
      },
      {
        id: "custom-amount",
        label: "Custom Amount",
        icon: IconNorthStar,
        description: "Set custom amount",
        route: "/dashboard/api/custom",
      },
      {
        id: "get-custom",
        label: "Get Custom Amount",
        icon: IconNorthStar,
        description: "Get custom amounts",
        route: "/dashboard/api/get-custom",
      },
      {
        id: "camp-details",
        label: "Camp Details",
        icon: IconFolders,
        description: "Campaign details",
        route: "/dashboard/api/camp",
      },
      {
        id: "check-pending",
        label: "Check Pending",
        icon: IconClock,
        description: "Check pending payments",
        route: "/dashboard/api/pendingCheck",
      },
      {
        id: "release-pending",
        label: "Release Pending",
        icon: IconLock,
        description: "Release pending payments",
        route: "/dashboard/api/releasePending",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: IconShieldLock,
    hasSubItems: true,
    subItems: [
      {
        id: "ban-upi",
        label: "Ban Upi",
        icon: IconLockPassword,
        description: "Manage banned UPIs",
        route: "/dashboard/ban-upi",
      },
      {
        id: "telegram-alerts",
        label: "Telegram Alerts",
        icon: IconCode,
        description: "Telegram alert settings",
        route: "/dashboard/telegram-alerts",
      },
      {
        id: "monitor-smartphone",
        label: "Login Devices",
        icon: IconDeviceMobile,
        description: "Connected devices",
        route: "/dashboard/devices",
      },
    ],
  },
  {
    id: "custom",
    label: "Custom",
    icon: IconDiamond,
    hasSubItems: true,
    subItems: [
      {
        id: "add-custom",
        label: "Add Custom",
        icon: ListPlus,
        description: "Add custom amount",
        route: "/dashboard/customAmount",
      },
      {
        id: "view-custom",
        label: "View Custom",
        icon: TableOfContents,
        description: "View custom amounts",
        route: "/dashboard/viewCustom",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: IconSettings,
    hasSubItems: true,
    subItems: [
      {
        id: "gateway-settings",
        label: "Gateway Settings",
        icon: IconKey,
        description: "Payment gateway configuration",
        route: "/dashboard/geteway-settings",
      },
    ],
  },
];

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface DashboardSidebarProps {
  activeSection?: string | null;
  setActiveSection?: (section: string | null) => void;
  selectedSubItem?: string | null;
  setSelectedSubItem?: (item: string | null) => void;
  showSubNav?: boolean;
  collapsed?: boolean;
}

export function DashboardSidebar({
  activeSection: controlledActiveSection,
  setActiveSection: setControlledActiveSection,
  selectedSubItem: controlledSelectedSubItem,
  setSelectedSubItem: setControlledSelectedSubItem,
  showSubNav = true,
  collapsed = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [internalActiveSection, setInternalActiveSection] = useState<
    string | null
  >(null);
  const [internalSelectedSubItem, setInternalSelectedSubItem] = useState<
    string | null
  >(null);

  const activeSection =
    controlledActiveSection !== undefined
      ? controlledActiveSection
      : internalActiveSection;
  const setActiveSection =
    setControlledActiveSection || setInternalActiveSection;
  const selectedSubItem =
    controlledSelectedSubItem !== undefined
      ? controlledSelectedSubItem
      : internalSelectedSubItem;
  const setSelectedSubItem =
    setControlledSelectedSubItem || setInternalSelectedSubItem;

  const activeItemData = sidebarItems.find((item) => item.id === activeSection);

  const { data: user } = useUserProfile();

  const handleItemClick = (item: SidebarItem) => {
    if (item.hasSubItems && showSubNav) {
      const isActive = activeSection === item.id;
      setActiveSection(isActive ? null : item.id);
      if (isActive) {
        setSelectedSubItem(null);
      }
    } else if (!item.hasSubItems) {
      setActiveSection(null);
      setSelectedSubItem(null);
      router.push(item.route || "/dashboard");
    }
  };

  const handleSubItemClick = (subItem: SubItem) => {
    setSelectedSubItem(subItem.id);
    router.push(subItem.route);
  };

  if (collapsed) {
    return (
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="none"
        className="w-16"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const hasActiveChild = item.subItems?.some((sub) =>
                    pathname.startsWith(sub.route),
                  );

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive || hasActiveChild}
                        className="w-full h-12 justify-center px-0"
                        onClick={() => handleItemClick(item)}
                        title={item.label}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="h-5 w-5 shrink-0" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <SidebarMenuButton
                    className="w-full h-12 justify-center px-0"
                    title="User Menu"
                  >
                    <IconLogout className="h-5 w-5 shrink-0 hover:text-destructive" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  sideOffset={8}
                  className="w-48"
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarImage src={user?.profileImg} alt={user?.name} />
                        <AvatarFallback className="rounded-full">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user?.name || "User"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.email || "user@example.com"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 w-full"
                    >
                      <IconUserCircle className="h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/billing"
                      className="flex items-center gap-2.5 w-full"
                    >
                      <IconWallet className="h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-2.5 w-full text-destructive"
                    >
                      <IconLogout className="h-4 w-4" />
                      Log out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar side="left" variant="sidebar" collapsible="none" className="w-64 ">
      <SidebarHeader>
        <DashboardTeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const hasActiveChild = item.subItems?.some((sub) =>
                  pathname.startsWith(sub.route),
                );

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive || hasActiveChild}
                      className="w-full h-10 px-3"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-auto min-w-fit">
                        {(item.badge || item.hasSubItems) &&
                          (item.badge ? (
                            <SidebarMenuBadge className="min-w-fit">
                              {item.badge}
                            </SidebarMenuBadge>
                          ) : (
                            <IconChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform shrink-0",
                                isActive && "rotate-90",
                              )}
                            />
                          ))}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton className="w-full h-12 px-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground max-w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {user?.profileImg ? (
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarImage src={user.profileImg} alt={user.name} />
                        <AvatarFallback className="rounded-full">
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="rounded-full">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">
                        {user?.name.trim().slice(0, 15) || <Skeleton className="h-4 w-20" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user?.email?.trim() || <Skeleton className="h-3 w-28" />}
                      </div>
                    </div>
                  </div>
                  <IconDotsVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={4}
                className="w-56"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage src={user?.profileImg} alt={user?.name} />
                      <AvatarFallback className="rounded-full">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user?.name.trim() || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2.5 w-full"
                  >
                    <IconUserCircle className="h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center gap-2.5 w-full"
                  >
                    <IconWallet className="h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2.5 w-full text-destructive"
                  >
                    <IconLogout className="h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

interface SubNavSidebarProps {
  section: string;
  items: SubItem[];
  selectedItem?: string | null;
  onSelectItem?: (item: SubItem) => void;
  onClose?: () => void;
}

export function SubNavSidebar({
  section,
  items,
  selectedItem,
  onSelectItem,
  onClose,
}: SubNavSidebarProps) {
  const router = useRouter();

  const handleItemClick = (item: SubItem) => {
    onSelectItem?.(item);
    router.push(item.route);
  };

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="none"
      className="w-72 animate-in slide-in-from-left-5 duration-200 border-r"
    >
      <SidebarHeader className="flex flex-row items-center justify-between border-b px-4 pt-5 pb-4.5 py">
        <h3 className="font-medium">{section}</h3>
        <button
          onClick={onClose}
          className="h-6 w-6 p-0 rounded-md hover:bg-sidebar-accent flex items-center justify-center"
        >
          <IconX className="h-4 w-4" />
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedItem === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isSelected}
                      className="w-full justify-start gap-3 h-auto py-2 px-3"
                      onClick={() => handleItemClick(item)}
                    >
                      <Icon className="h-5 w-5 shrink-0 self-start mt-0.5" />

                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export { sidebarItems };
