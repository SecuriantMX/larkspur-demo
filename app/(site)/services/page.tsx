"use client";

import { ButtonLink } from "@/components/ui";
import { money } from "@/lib/format";
import { usePublicData } from "@/lib/use-content";

export default function ServicesPage() {
  const { spaces, user } = usePublicData();
  return (
    <div className="mx-auto max-w-6xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Spaces and hourly rates</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Every space is bookable by the hour from your dashboard. Rates include Wi-Fi, coffee and a cleaned room at the start of your slot.
      </p>
      <div className="mt-10 overflow-hidden rounded-lg border border-line bg-surface">
        {spaces.map((s, i) => (
          <article
            key={s.id}
            className={`grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 ${i ? "border-t border-line" : ""}`}
          >
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink-soft uppercase">{s.kind} · up to {s.capacity} {s.capacity > 1 ? "people" : "person"}</p>
              <h2 className="mt-1 font-display text-xl font-semibold">{s.name}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.description}</p>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <p className="tabular text-lg font-semibold">
                {money(s.hourlyRate)}
                <span className="text-sm font-normal text-ink-soft"> / hour</span>
              </p>
              <ButtonLink href={user ? "/app/bookings" : "/signup"} variant="secondary" size="sm">
                Book
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
