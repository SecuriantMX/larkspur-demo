"use client";

import { AvailabilityBoard } from "@/components/availability-board";
import { ButtonLink } from "@/components/ui";
import { money } from "@/lib/format";
import { usePublicData } from "@/lib/use-content";

export default function ServicesPage() {
  const { spaces, user } = usePublicData();
  return (
    <div className="mx-auto max-w-7xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <div className="grid gap-6 border-b-2 border-ink pb-6 lg:grid-cols-[1fr_24rem] lg:items-end">
        <h1 className="sign text-6xl sm:text-8xl">Spaces &amp; rates</h1>
        <p className="text-ink-soft">
          Every room books by the hour from your dashboard. Rates include Wi-Fi, coffee, and a room that&apos;s been cleaned before your slot starts.
        </p>
      </div>

      <div className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3 mt-10">
        {spaces.map((s) => (
          <article key={s.id} className="flex flex-col bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-2">
              <span className="bg-ink px-1.5 py-0.5 font-mono text-[0.6875rem] text-paper">UNIT {s.unit || "—"}</span>
              <span className="eyebrow text-ink-soft">{s.kind}</span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <h2 className="font-display text-4xl leading-none font-extrabold uppercase">{s.name}</h2>
              <p className="text-sm leading-relaxed text-ink-soft">{s.description}</p>
              <dl className="mt-auto grid grid-cols-2 border-t border-line pt-3 font-mono text-xs uppercase">
                <div>
                  <dt className="text-ink-soft">Seats</dt>
                  <dd className="mt-0.5 text-base tabular">{s.capacity}</dd>
                </div>
                <div>
                  <dt className="text-ink-soft">Per hour</dt>
                  <dd className="mt-0.5 text-base tabular">{money(s.hourlyRate)}</dd>
                </div>
              </dl>
              <ButtonLink href={user ? "/app/bookings?new=1" : "/signup"} variant="secondary" size="sm" className="mt-2 self-start">
                Book {s.unit || "this room"}
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16">
        <AvailabilityBoard />
      </section>
    </div>
  );
}
