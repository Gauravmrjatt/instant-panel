"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconHome,
  IconFolders,
  IconWallet,
  IconHistory,
  IconCode,
  IconShieldLock,
  IconSettings,
  IconChevronRight,
  IconLogout,
  IconWebhook,
  IconDiamond,
  IconDeviceMobile,
} from "@tabler/icons-react";

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
    id: "custom",
    label: "Custom",
    icon: IconDiamond,
    hasSubItems: true,
    subItems: [
      {
        id: "view-custom",
        label: "View Custom",
        icon: IconDiamond,
        description: "View custom amounts",
        route: "/dashboard/viewCustom",
      },
      {
        id: "add-custom",
        label: "Add Custom",
        icon: IconDiamond,
        description: "Add custom amount",
        route: "/dashboard/customAmount",
      },
    ],
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
        icon: IconFolders,
        description: "Create a new campaign",
        route: "/dashboard/campaigns",
      },
      {
        id: "campaigns-list",
        label: "Campaigns",
        icon: IconFolders,
        description: "View all campaigns",
        route: "/dashboard/liveCampaigns",
      },
      {
        id: "reports",
        label: "Reports",
        icon: IconFolders,
        description: "Campaign reports",
        route: "/dashboard/reports",
      },
      {
        id: "click-details",
        label: "Click Details",
        icon: IconFolders,
        description: "Click tracking",
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
        icon: IconWallet,
        description: "Pay amount to user",
        route: "/dashboard/pay-to-user",
      },
      {
        id: "pay-clickid",
        label: "Pay ClickId",
        icon: IconWallet,
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
        icon: IconHistory,
        description: "View pending payments",
        route: "/dashboard/pending",
      },
      {
        id: "payments",
        label: "Payments",
        icon: IconHistory,
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
        icon: IconCode,
        description: "Check referrer",
        route: "/dashboard/api/checkRefer",
      },
      {
        id: "user-check",
        label: "User Check",
        icon: IconCode,
        description: "Check user details",
        route: "/dashboard/api/user",
      },
      {
        id: "custom-amount",
        label: "Custom Amount",
        icon: IconCode,
        description: "Set custom amount",
        route: "/dashboard/api/custom",
      },
      {
        id: "get-custom",
        label: "Get Custom Amount",
        icon: IconCode,
        description: "Get custom amounts",
        route: "/dashboard/api/get-custom",
      },
      {
        id: "camp-details",
        label: "Camp Details",
        icon: IconCode,
        description: "Campaign details",
        route: "/dashboard/api/camp",
      },
      {
        id: "check-pending",
        label: "Check Pending",
        icon: IconCode,
        description: "Check pending payments",
        route: "/dashboard/api/pendingCheck",
      },
      {
        id: "release-pending",
        label: "Release Pending",
        icon: IconCode,
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
        icon: IconShieldLock,
        description: "Manage banned UPIs",
        route: "/dashboard/ban-upi",
      },
      {
        id: "telegram-alerts",
        label: "Telegram Alerts",
        icon: IconShieldLock,
        description: "Telegram settings",
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
    id: "settings",
    label: "Settings",
    icon: IconSettings,
    hasSubItems: true,
    subItems: [
      {
        id: "gateway-settings",
        label: "Gateway Settings",
        icon: IconSettings,
        description: "Payment gateway config",
        route: "/dashboard/geteway-settings",
      },
    ],
  },
];

interface MobileNavProps {
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  selectedSubItem: string | null;
  setSelectedSubItem: (item: string | null) => void;
  onClose: () => void;
}

export function MobileNav({
  activeSection,
  setActiveSection,
  selectedSubItem,
  setSelectedSubItem,
  onClose,
}: MobileNavProps) {
  const router = useRouter();
  const { data: user } = useUserProfile();

  const handleMainItemClick = (item: SidebarItem) => {
    if (item.hasSubItems) {
      const isActive = activeSection === item.id;
      if (isActive) {
        setActiveSection(null);
        setSelectedSubItem(null);
      } else {
        setActiveSection(item.id);
        setSelectedSubItem(null);
      }
    } else {
      onClose();
      if (item.route) {
        router.push(item.route);
      }
    }
  };

  const handleSubItemClick = (subItem: SubItem) => {
    onClose();
    router.push(subItem.route);
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <span className="text-sm font-bold">
              {siteConfig.name.charAt(0)}
            </span>
          </div>
          <span className="font-bold text-lg">{siteConfig.name}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Menu */}
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleMainItemClick(item)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.hasSubItems && (
                    <IconChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform shrink-0",
                        isActive && "rotate-90",
                      )}
                    />
                  )}
                </button>

                {/* Sub Items */}
                {isActive && item.subItems && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-muted pl-3">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSelected = selectedSubItem === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted",
                          )}
                        >
                          <SubIcon className="h-4 w-4 shrink-0" />
                          <span className="text-left">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          {user?.profileImg ? (
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={user.profileImg} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user?.name?.trim() || "User"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email?.trim() || "user@example.com"}
            </div>
          </div>
        </div>
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            <IconLogout className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}
