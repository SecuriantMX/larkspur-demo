"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { usePublicData } from "@/lib/use-content";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { content } = usePublicData();
  return (
    <div className="grid min-h-[calc(100vh-1.75rem)] lg:grid-cols-[1fr_32rem]">
      <aside className="relative hidden overflow-hidden bg-board text-board-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo name={content.siteName} inverted />
        <div>
          <p className="font-stencil text-[13rem] leading-[0.8] text-tape">1720</p>
          <p className="sign mt-4 text-5xl">E Main St · Door on the left</p>
          <p className="mt-6 max-w-md font-mono text-xs leading-relaxed opacity-70">
            Members get in with the same account they book with. Front desk hours: {content.hours}.
          </p>
        </div>
        <div className="h-3 bg-[repeating-linear-gradient(-45deg,var(--tape)_0_14px,transparent_14px_28px)]" aria-hidden="true" />
      </aside>
      <div className="flex flex-col px-[max(16px,env(safe-area-inset-left))] py-10 sm:px-12">
        <div className="lg:hidden">
          <Logo name={content.siteName} />
        </div>
        <div className="my-auto w-full max-w-sm py-10 lg:mx-auto">{children}</div>
        <Link href="/" className="text-accent self-start text-sm lg:self-center">
          Back to {content.siteName}
        </Link>
      </div>
    </div>
  );
}
