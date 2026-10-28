"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { initials } from "@/lib/format";
import { signOut, useSession } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Logo } from "./logo";
import { Loading, cx } from "./ui";

export type NavItem = { href: string; label: string; icon: ComponentType<{ size?: number }>; exact?: boolean };

export function DashboardShell({
  role,
  nav,
  children,
}: {
  role: Role;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const { state, user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Set on deliberate sign-out so the guard below doesn't bounce the user to the login page.
  const leaving = useRef(false);

  const allowed = !!user && user.status === "active" && (role === "member" || user.role === "admin");

  useEffect(() => {
    if (!state || leaving.current) return;
    if (!user || user.status !== "active") {
      if (user) signOut();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (role === "admin" && user.role !== "admin") {
      router.replace("/app");
    }
  }, [state, user, role, router, pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!state || !user || !allowed) return <Loading />;

  const unread = state.notifications.filter((n) => n.userId === user.id && !n.read).length;
  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const navList = (
    <nav className="flex flex-col gap-0.5" aria-label={role === "admin" ? "Admin" : "Account"}>
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "flex items-center gap-3 px-3 py-2 font-display text-lg font-semibold uppercase",
              isActive(item) ? "bg-tape text-tape-ink" : "opacity-75 hover:opacity-100",
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="flex flex-col gap-3 border-t border-current/20 pt-4">
      {user.role === "admin" && (
        <Link href={role === "admin" ? "/app" : "/admin"} className="eyebrow px-3 underline decoration-tape decoration-2 underline-offset-4">
          {role === "admin" ? "Switch to member view" : "Open admin panel"}
        </Link>
      )}
      <div className="flex items-center gap-3 px-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-tape font-mono text-[0.6875rem] font-medium text-tape-ink">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs opacity-60">{user.email}</p>
        </div>
        <button
          onClick={() => {
            leaving.current = true;
            signOut();
            router.push("/");
          }}
          className="p-1.5 opacity-70 hover:bg-tape hover:text-tape-ink hover:opacity-100"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden bg-board text-board-ink lg:flex lg:flex-col lg:gap-6 lg:px-3 lg:py-5">
        <div className="flex flex-col gap-3 px-3">
          <Logo name={state.content.siteName} href={role === "admin" ? "/admin" : "/app"} inverted />
          <p className="eyebrow opacity-60">{role === "admin" ? "Directory · Front office" : "Directory · Members"}</p>
        </div>
        <div className="flex-1">{navList}</div>
        {footer}
      </aside>

      <div className="min-w-0">
        <header className="flex h-14 items-center justify-between gap-3 border-b-2 border-ink bg-paper px-[max(16px,env(safe-area-inset-left))]">
          <div className="flex items-center gap-2 lg:hidden">
            <button className="p-2" onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo name={state.content.siteName} href={role === "admin" ? "/admin" : "/app"} />
          </div>
          <Link href="/" className="eyebrow hidden text-ink-soft hover:text-ink lg:block">
            ← Public website
          </Link>
          {role === "member" ? (
            <Link
              href="/app/notifications"
              className="relative p-2 text-ink-soft hover:bg-tape hover:text-tape-ink"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center bg-brick px-1 font-mono text-[10px] text-white">
                  {unread}
                </span>
              )}
            </Link>
          ) : (
            <span className="eyebrow text-ink-soft">On duty: {user.name}</span>
          )}
        </header>

        {menuOpen && (
          <div className="flex flex-col gap-4 bg-board px-[max(16px,env(safe-area-inset-left))] py-4 text-board-ink lg:hidden">
            {navList}
            {footer}
          </div>
        )}

        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-[max(16px,env(safe-area-inset-left))] py-8">{children}</main>
      </div>
    </div>
  );
}
