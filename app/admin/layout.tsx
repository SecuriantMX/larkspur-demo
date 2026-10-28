"use client";

import { Building2, FileText, History, Inbox, LayoutDashboard, Receipt, Users } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const nav: NavItem[] = [
  { href: "/admin", label: "Analytics", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/catalog", label: "Spaces & plans", icon: Building2 },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/tickets", label: "Support inbox", icon: Inbox },
  { href: "/admin/content", label: "Website content", icon: FileText },
  { href: "/admin/activity", label: "Activity log", icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin" nav={nav}>
      {children}
    </DashboardShell>
  );
}
