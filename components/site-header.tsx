"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePublicData } from "@/lib/use-content";
import { Logo } from "./logo";
import { ButtonLink, cx } from "./ui";

const links = [
  { href: "/services", label: "Spaces" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { content, user } = usePublicData();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dashboard = user?.role === "admin" ? "/admin" : "/app";

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-[max(16px,env(safe-area-inset-left))]">
        <Logo name={content.siteName} />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cx(
                "rounded-md px-3 py-2 text-sm hover:text-ink",
                pathname === l.href ? "text-ink font-medium" : "text-ink-soft",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <ButtonLink href={dashboard}>Go to dashboard</ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup">Create account</ButtonLink>
            </>
          )}
        </div>
        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-[max(16px,env(safe-area-inset-left))] py-3 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            {user ? (
              <ButtonLink href={dashboard} className="flex-1">
                Go to dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="secondary" className="flex-1">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/signup" className="flex-1">
                  Create account
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
