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
  { href: "/pricing", label: "Membership" },
  { href: "/about", label: "The building" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { content, user } = usePublicData();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dashboard = user?.role === "admin" ? "/admin" : "/app";

  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-[max(16px,env(safe-area-inset-left))]">
        <Logo name={content.siteName} />
        <nav className="hidden items-stretch self-stretch md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cx(
                "flex items-center border-l border-line px-4 font-display text-lg font-semibold uppercase last:border-r",
                pathname === l.href ? "bg-tape text-tape-ink" : "text-ink-soft hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <ButtonLink href={dashboard}>My dashboard</ButtonLink>
          ) : (
            <>
              <Link href="/login" className="font-display text-lg font-semibold uppercase text-ink-soft hover:text-ink">
                Sign in
              </Link>
              <ButtonLink href="/signup">Get a key</ButtonLink>
            </>
          )}
        </div>
        <button
          className="p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-line px-[max(16px,env(safe-area-inset-left))] py-2 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3 font-display text-2xl font-bold uppercase"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 mb-2 flex gap-2">
            {user ? (
              <ButtonLink href={dashboard} className="flex-1">
                My dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="secondary" className="flex-1">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/signup" className="flex-1">
                  Get a key
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
