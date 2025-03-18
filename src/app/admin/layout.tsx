"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/ux/nav";
import { CustomSidebar } from "@/components/ux/sidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <CustomSidebar>
          {children}
        </CustomSidebar>
      </div>
    </div>
  );
}