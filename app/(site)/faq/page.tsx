"use client";

import Link from "next/link";
import { usePublicData } from "@/lib/use-content";

export default function FaqPage() {
  const { content } = usePublicData();
  return (
    <div className="mx-auto max-w-3xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Frequently asked questions</h1>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {content.faq.map((item) => (
          <details key={item.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.question}
              <span className="text-ink-soft transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-soft">
        Didn&apos;t find it?{" "}
        <Link href="/contact" className="font-medium text-accent">
          Send us a message
        </Link>
        .
      </p>
    </div>
  );
}
