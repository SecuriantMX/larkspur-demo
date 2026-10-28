"use client";

import Link from "next/link";
import { usePublicData } from "@/lib/use-content";

export function SiteFooter() {
  const { content } = usePublicData();
  return (
    <footer className="mt-24 bg-board text-board-ink">
      <div className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--tape)_0_14px,var(--board)_14px_28px)]" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-[max(16px,env(safe-area-inset-left))] py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-stencil text-6xl leading-none uppercase sm:text-7xl">{content.siteName}</p>
          <p className="mt-4 font-mono text-xs opacity-70">{content.address}</p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm">
          <p className="eyebrow text-tape">Front desk</p>
          <p className="select-all">{content.contactEmail}</p>
          <p className="select-all">{content.contactPhone}</p>
          <p className="opacity-70">{content.hours}</p>
        </div>
        <nav className="flex flex-col gap-1.5 text-sm" aria-label="Footer">
          <p className="eyebrow text-tape">Around the building</p>
          <Link className="hover:text-tape" href="/services">Spaces and rates</Link>
          <Link className="hover:text-tape" href="/pricing">Membership</Link>
          <Link className="hover:text-tape" href="/faq">FAQ</Link>
          <Link className="hover:text-tape" href="/login">Member sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
