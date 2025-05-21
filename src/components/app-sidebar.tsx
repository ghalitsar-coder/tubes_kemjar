"use client";

import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { RoleIndicator } from "@/components/role-indicator";
import { RoleSwitcher } from "@/components/role-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import Link from "next/link";
import { IconInnerShadowTop, IconLoader2 } from "@tabler/icons-react";
import { patientNavItems, doctorNavItems, adminNavItems } from "./sidebar-data";
import { useUserRole } from "@/lib/auth-protection";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role, isLoading } = useUserRole();

  // Determine which navigation items to use based on user role
  const navigationItems = React.useMemo(() => {
    if (role === "DOCTOR") {
      return doctorNavItems;
    } else if (role === "ADMIN") {
      return adminNavItems;
    } else {
      // Default to patient view (also used when role is still loading)
      return patientNavItems;
    }
  }, [role]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Medicare</span>
                {isLoading && (
                  <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems.navMain} />
        <NavDocuments items={navigationItems.documents} />
        <NavSecondary
          items={navigationItems.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>{" "}
      <SidebarFooter>
        <SignedIn>
          <div className="flex items-center justify-between w-full gap-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col gap-2 items-end">
              <RoleIndicator />
              {process.env.NODE_ENV === "development" && <RoleSwitcher />}
            </div>
          </div>
        </SignedIn>
      </SidebarFooter>
    </Sidebar>
  );
}
