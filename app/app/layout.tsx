"use client";

import { Bell, CalendarDays, CreditCard, LayoutDashboard, LifeBuoy, UserRound } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const nav: NavItem[] = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/support", label: "Support", icon: LifeBuoy },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="member" nav={nav}>
      {children}
    </DashboardShell>
  );
}
