import Link from "next/link";

export function Logo({ name, href = "/" }: { name: string; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="1" y="1" width="20" height="20" rx="4" fill="var(--accent)" />
        <path d="M7 5v12h8" stroke="var(--accent-ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="14.5" cy="7.5" r="2" fill="var(--accent-ink)" />
      </svg>
      {name}
    </Link>
  );
}
