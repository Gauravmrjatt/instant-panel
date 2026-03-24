"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconChartBar,
  IconFolder,
  IconFolders,
  IconWallet,
  IconSettings,
  IconHistory,
  IconCode,
  IconShieldLock,
  IconUser,
  IconLogout,
  IconCreditCard,
  IconBan,
  IconBrandTelegram,
  IconClick,
  IconReport,
  IconSearch,
  IconSend,
  IconUserCheck,
  IconCoins,
  IconDeviceDesktop,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/config"

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  hasSubItems?: boolean
  route?: string
  subItems?: {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    description?: string
    route?: string
  }[]
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: IconChartBar,
    hasSubItems: false,
    route: "/dashboard",
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
        id: "live-campaigns",
        label: "Live Campaigns",
        icon: IconDeviceDesktop,
        description: "View all campaigns",
        route: "/dashboard/liveCampaigns",
      },
      {
        id: "reports",
        label: "Reports",
        icon: IconReport,
        description: "Campaign reports",
        route: "/dashboard/reports",
      },
      {
        id: "clicks",
        label: "Click Details",
        icon: IconSearch,
        description: "Search click data",
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
        icon: IconSend,
        description: "Pay to user account",
        route: "/dashboard/pay-to-user",
      },
      {
        id: "click-pay",
        label: "Pay ClickId",
        icon: IconClick,
        description: "Pay by click ID",
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
        id: "pending",
        label: "Pending Payments",
        icon: IconHistory,
        description: "View pending payments",
        route: "/dashboard/pending",
      },
      {
        id: "payments",
        label: "Payments",
        icon: IconCreditCard,
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
        icon: IconUserCheck,
        description: "Check refer status",
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
        icon: IconCoins,
        description: "Set custom amounts",
        route: "/dashboard/api/custom",
      },
      {
        id: "camp-details",
        label: "Camp Details",
        icon: IconDeviceDesktop,
        description: "Get campaign details",
        route: "/dashboard/api/camp",
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
        label: "Ban UPI",
        icon: IconBan,
        description: "Manage banned UPIs",
        route: "/dashboard/ban-upi",
      },
      {
        id: "telegram",
        label: "Telegram Alerts",
        icon: IconBrandTelegram,
        description: "Telegram notifications",
        route: "/dashboard/telegram-alerts",
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
        id: "gateway",
        label: "Gateway Settings",
        icon: IconSettings,
        description: "Configure payment gateway",
        route: "/dashboard/geteway-settings",
      },
      {
        id: "profile",
        label: "Profile",
        icon: IconUser,
        description: "Your profile settings",
        route: "/dashboard/profile",
      },
    ],
  },
]

interface DashboardSidebarProps {
  activeItem: string | null
  setActiveItem: (item: string | null) => void
  selectedSubItem: string | null
  setSelectedSubItem: (item: string | null) => void
}

export function DashboardSidebar({
  activeItem,
  setActiveItem,
  selectedSubItem,
  setSelectedSubItem,
}: DashboardSidebarProps) {
  const pathname = usePathname()

  const handleItemClick = (item: SidebarItem) => {
    if (item.hasSubItems) {
      const isActive = activeItem === item.id
      setActiveItem(isActive ? null : item.id)
      if (isActive) {
        setSelectedSubItem(null)
      }
    } else if (item.route) {
      window.location.href = item.route
    }
  }

  const handleSubItemClick = (subItem: { id: string; route?: string }) => {
    setSelectedSubItem(selectedSubItem === subItem.id ? null : subItem.id)
    if (subItem.route) {
      window.location.href = subItem.route
    }
  }

  const activeItemData = sidebarItems.find((item) => item.id === activeItem)

  return (
    <div className="flex h-dvh bg-background">
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="text-xl font-bold">
            {siteConfig.name}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              const isCurrentRoute = pathname === item.route

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isCurrentRoute || isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.hasSubItems && (
                      <span className="text-xs">›</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <IconLogout className="h-4 w-4" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Sub Navigation */}
      {activeItem && activeItemData?.subItems && (
        <aside className="w-72 border-r bg-muted/30 animate-in slide-in-from-left-5 duration-200">
          <div className="h-16 flex items-center px-6 border-b">
            <h3 className="font-medium">{activeItemData.label}</h3>
            <button
              onClick={() => setActiveItem(null)}
              className="ml-auto h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {activeItemData.subItems.map((subItem) => {
                const SubIcon = subItem.icon
                const isSelected = selectedSubItem === subItem.id
                const isCurrentRoute = pathname === subItem.route

                return (
                  <li key={subItem.id}>
                    <button
                      onClick={() => handleSubItemClick(subItem)}
                      className={cn(
                        "w-full flex items-start gap-3 py-3 px-3 rounded-md text-sm transition-colors",
                        isCurrentRoute || isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <SubIcon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium">{subItem.label}</div>
                        {subItem.description && (
                          <div className={cn(
                            "text-xs mt-0.5",
                            isCurrentRoute || isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {subItem.description}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>
      )}
    </div>
  )
}
