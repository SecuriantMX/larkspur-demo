"use client";

import Link from "next/link";
import { usePublicData } from "@/lib/use-content";

export function SiteFooter() {
  const { content } = usePublicData();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-[max(16px,env(safe-area-inset-left))] py-10 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <p className="font-display text-base font-semibold">{content.siteName}</p>
          <p className="text-ink-soft">{content.address}</p>
          <p className="text-ink-soft">{content.hours}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Contact</p>
          <p className="text-ink-soft select-all">{content.contactEmail}</p>
          <p className="text-ink-soft select-all">{content.contactPhone}</p>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Footer">
          <p className="font-medium">Explore</p>
          <Link className="text-ink-soft hover:text-ink" href="/services">Spaces and rates</Link>
          <Link className="text-ink-soft hover:text-ink" href="/pricing">Memberships</Link>
          <Link className="text-ink-soft hover:text-ink" href="/faq">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
