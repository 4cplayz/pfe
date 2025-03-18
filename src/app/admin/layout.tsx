"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/ux/nav";
import { BookOpen, Users, BarChart3, FileText, Settings, Lock } from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarInset
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme/themeSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center px-2">
                <BookOpen className="mr-2 h-6 w-6" />
                <span className="font-semibold text-lg">PFE Admin</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/admin" passHref legacyBehavior>
                    <SidebarMenuButton isActive={isActive("/admin")} tooltip="Dashboard">
                      <BarChart3 /> Dashboard
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/admin/journals" passHref legacyBehavior>
                    <SidebarMenuButton isActive={isActive("/admin/journals")} tooltip="Journals">
                      <FileText /> Journals
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/admin/stats" passHref legacyBehavior>
                    <SidebarMenuButton isActive={isActive("/admin/stats")} tooltip="Statistics">
                      <BarChart3 /> Statistics
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/admin/manager" passHref legacyBehavior>
                    <SidebarMenuButton isActive={isActive("/admin/manager")} tooltip="User Management">
                      <Users /> User Management
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/admin/access" passHref legacyBehavior>
                    <SidebarMenuButton isActive={isActive("/admin/access")} tooltip="Access Control">
                      <Lock /> Access Control
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThemeSwitcher />
                </div>
                <div className="text-xs text-muted-foreground">
                  v0.1.0
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <div className="container h-full p-4 md:p-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}