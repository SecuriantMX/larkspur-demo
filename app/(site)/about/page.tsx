"use client";

import { usePublicData } from "@/lib/use-content";

export default function AboutPage() {
  const { content } = usePublicData();
  return (
    <article className="mx-auto max-w-4xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <p className="eyebrow inline-block bg-ink px-1.5 py-0.5 text-paper">About {content.siteName}</p>
      <h1 className="sign mt-4 text-6xl sm:text-7xl">{content.aboutTitle}</h1>
      <div className="mt-8 flex max-w-[65ch] flex-col gap-4 border-l-4 border-tape pl-5 text-lg leading-relaxed">
        {content.aboutBody.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <dl className="mt-12 grid border-2 border-ink sm:grid-cols-2">
        <div className="border-ink p-5 max-sm:border-b-2 sm:border-r-2">
          <dt className="eyebrow text-ink-soft">Address</dt>
          <dd className="mt-1 font-display text-2xl font-bold uppercase">{content.address}</dd>
        </div>
        <div className="p-5">
          <dt className="eyebrow text-ink-soft">Staffed hours</dt>
          <dd className="mt-1 font-display text-2xl font-bold uppercase">{content.hours}</dd>
        </div>
      </dl>
    </article>
  );
}
