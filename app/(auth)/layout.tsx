"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { usePublicData } from "@/lib/use-content";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { content } = usePublicData();
  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col items-center px-[max(16px,env(safe-area-inset-left))] py-12">
      <Logo name={content.siteName} />
      <div className="mt-8 w-full max-w-sm">{children}</div>
      <Link href="/" className="mt-8 text-sm text-ink-soft hover:text-ink">
        Back to {content.siteName}
      </Link>
    </div>
  );
}
