"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/lib/config";
import Link from "next/link";

export function DashboardTeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/dashboard">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <span className="text-sm font-bold">
                {siteConfig.name.charAt(0)}
              </span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{siteConfig.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                Dashboard
              </span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
