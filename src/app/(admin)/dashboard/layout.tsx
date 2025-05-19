import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RoleProtected } from "@/lib/auth-protection";
import { redirect } from "next/navigation";
import React from "react";

interface Layoutprops {
  children: React.ReactNode;
}

const Layout = (props: Layoutprops) => {
  const { children } = props;
  return (
    // <RoleProtected
    //   allowedRoles={["ADMIN", "STAFF", "DOCTOR"]}
    //   fallback={
    //     <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
    //       <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
    //         <h1 className="text-2xl font-bold text-red-600 mb-4">
    //           Unauthorized Access
    //         </h1>
    //         <p className="text-gray-600 mb-4">
    //           You do not have permission to access this administration area.
    //           This area is restricted to staff, doctors, and administrators
    //           only.
    //         </p>
    //         <p className="text-gray-500 mb-6">
    //           You will be redirected to the home page in a few seconds.
    //         </p>
             
    //       </div>
    //     </div>
    //   }
    // >
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    // </RoleProtected>
  );
};

export default Layout;
