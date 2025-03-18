"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Users, BarChart3, FileText, Lock, Settings } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/themeSwitcher";

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarItem({ href, icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

interface CustomSidebarProps {
  children: ReactNode;
}

export function CustomSidebar({ children }: CustomSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", icon: <BarChart3 size={20} />, label: "Dashboard" },
    { href: "/admin/journals", icon: <FileText size={20} />, label: "Journal de bord" },
    { href: "/admin/stats", icon: <BarChart3 size={20} />, label: "Statistique" },
    { href: "/admin/manager", icon: <Users size={20} />, label: "Parametre d'acces" },
    { href: "/admin/access", icon: <Lock size={20} />, label: "Access Control" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container p-6">
          {children}
        </div>
      </div>
    </div>
  );
}