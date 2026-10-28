"use client";

import { usePublicData } from "@/lib/use-content";

export default function AboutPage() {
  const { content } = usePublicData();
  return (
    <article className="mx-auto max-w-3xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <p className="font-mono text-xs tracking-wide text-brick uppercase">About {content.siteName}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{content.aboutTitle}</h1>
      <div className="mt-6 flex max-w-[65ch] flex-col gap-4 text-lg leading-relaxed text-ink-soft">
        {content.aboutBody.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-soft">Address</dt>
          <dd className="mt-1 font-medium">{content.address}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Staffed hours</dt>
          <dd className="mt-1 font-medium">{content.hours}</dd>
        </div>
      </dl>
    </article>
  );
}
