"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import {
  DashboardSidebar,
  SubNavSidebar,
  sidebarItems,
} from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  // All hooks must be called unconditionally at the top
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [isSubNavOpen, setIsSubNavOpen] = useState(false);

  // Auth redirect effect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/auth/login";
    }
  }, [isLoading, isAuthenticated]);

  // Pathname tracking effect
  useEffect(() => {
    const currentItem = sidebarItems.find((item) =>
      item.subItems?.some((sub) => pathname.startsWith(sub.route)),
    );
    if (currentItem) {
      setActiveSection(currentItem.id);
      const currentSubItem = currentItem.subItems?.find((sub) =>
        pathname.startsWith(sub.route),
      );
      if (currentSubItem) {
        setSelectedSubItem(currentSubItem.id);
      }
    } else {
      setActiveSection(null);
      setSelectedSubItem(null);
    }
  }, [pathname]);

  // Sub nav visibility effect
  useEffect(() => {
    setIsSubNavOpen(
      !!(
        activeSection &&
        sidebarItems.find((item) => item.id === activeSection)?.subItems?.length
      ),
    );
  }, [activeSection]);

  // Early return AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeItemData = sidebarItems.find((item) => item.id === activeSection);

  const handleSubNavClose = () => {
    setActiveSection(null);
    setSelectedSubItem(null);
  };

  const handleMobileNavClose = () => {
    setOpenMobile(false);
    if (activeItemData?.subItems && selectedSubItem) {
      const currentItem = activeItemData.subItems.find(
        (s) => s.id === selectedSubItem,
      );
      if (currentItem) {
        window.location.href = currentItem.route;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar - Collapsed when sub-nav is open */}
        <div className="hidden md:block">
          <DashboardSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            selectedSubItem={selectedSubItem}
            setSelectedSubItem={setSelectedSubItem}
            showSubNav={true}
            collapsed={isSubNavOpen}
          />
        </div>

        {/* Desktop Sub Nav */}
        {activeSection && activeItemData?.subItems && (
          <div className="shrink-0 hidden md:block">
            <SubNavSidebar
              section={activeItemData.label}
              items={activeItemData.subItems}
              selectedItem={selectedSubItem}
              onSelectItem={(item) => setSelectedSubItem(item.id)}
              onClose={handleSubNavClose}
            />
          </div>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent
              side="left"
              className="p-0 w-[300px]"
              aria-describedby={undefined}
            >
              <MobileNav
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                selectedSubItem={selectedSubItem}
                setSelectedSubItem={setSelectedSubItem}
                onClose={() => setOpenMobile(false)}
              />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-sidebar">
          <header className="sticky md:hidden top-0 z-30 flex h-16 items-center gap-4  bg-sidebar border-b border-border px-4 md:px-6 shrink-0">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMobile(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex flex-1 items-center justify-end gap-4">
              <Button variant="ghost" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </Button>
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 w-full rounded-t-lg">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
