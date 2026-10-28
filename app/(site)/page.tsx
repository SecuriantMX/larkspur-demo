"use client";

import Link from "next/link";
import { FloorPlan } from "@/components/floor-plan";
import { ButtonLink } from "@/components/ui";
import { money } from "@/lib/format";
import { usePublicData } from "@/lib/use-content";

const steps = [
  { title: "Get a key", body: "Make an account with email or Google. No card until you book or join." },
  { title: "Pick how you pay", body: "Monthly membership, or the posted hourly rate. Switch whenever." },
  { title: "Book the room, show up", body: "Reserve the hours you need. The invoice lands in your dashboard." },
];

export default function HomePage() {
  const { content, spaces, plans, user } = usePublicData();
  const cheapest = plans.length ? Math.min(...plans.map((p) => p.monthlyPrice)) : 0;

  return (
    <>
      <section className="concrete border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-[max(16px,env(safe-area-inset-left))] pt-10 pb-12 sm:pt-14">
          <p className="eyebrow flex flex-wrap gap-x-4 gap-y-1 text-ink-soft">
            <span className="bg-ink px-1.5 py-0.5 text-paper">{content.heroEyebrow}</span>
            <span className="py-0.5">{content.hours}</span>
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
            <h1 className="sign text-[clamp(3.25rem,9vw,7.5rem)]">{content.heroTitle}</h1>
            <div className="flex flex-col gap-5 lg:pb-3">
              <p className="text-lg leading-relaxed">{content.heroSubtitle}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={user ? "/app/bookings?new=1" : "/signup"} size="lg">
                  {user ? "Book a room" : "Get a key"}
                </ButtonLink>
                <ButtonLink href="/services" size="lg" variant="secondary">
                  Rates
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-[max(16px,env(safe-area-inset-left))] pt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="sign text-4xl sm:text-5xl">What&apos;s free right now</h2>
          <p className="max-w-sm text-sm text-ink-soft">
            Striped rooms are booked at this moment. Tap any room for its rate and to book it.
          </p>
        </div>
        <FloorPlan />
      </section>

      <section className="mx-auto max-w-7xl px-[max(16px,env(safe-area-inset-left))] pt-20">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <div>
            <h2 className="sign text-4xl sm:text-5xl">Posted rates</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Per hour, coffee and Wi-Fi included. Members are billed the same rate on their monthly invoice.
            </p>
            <Link href="/services" className="text-accent mt-4 inline-block text-sm font-medium">
              Full room details
            </Link>
          </div>
          <ol className="border-t-2 border-ink">
            {spaces.map((s) => (
              <li key={s.id} className="flex items-baseline gap-3 border-b border-line py-3">
                <span className="w-9 shrink-0 bg-ink py-0.5 text-center font-mono text-[0.6875rem] text-paper">{s.unit || "—"}</span>
                <span className="min-w-0">
                  <span className="font-display text-2xl font-bold uppercase">{s.name}</span>
                  <span className="ml-2 hidden font-mono text-[0.6875rem] text-ink-soft uppercase sm:inline">
                    {s.kind} · {s.capacity} seat{s.capacity > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="mb-1.5 hidden flex-1 border-b-2 border-dotted border-line sm:block" aria-hidden="true" />
                <span className="ml-auto shrink-0 font-display text-3xl font-extrabold tabular sm:ml-0">
                  {money(s.hourlyRate).replace(".00", "")}
                  <span className="font-mono text-xs font-normal text-ink-soft">/h</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-[max(16px,env(safe-area-inset-left))] pt-20">
        <h2 className="sign text-4xl sm:text-5xl">From the street to a booked room</h2>
        <ol className="mt-6 grid border-2 border-ink sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 border-ink p-5 not-last:border-b-2 sm:not-last:border-r-2 sm:not-last:border-b-0">
              <span className="font-stencil text-6xl leading-none text-brick">{i + 1}</span>
              <div>
                <p className="font-display text-2xl font-bold uppercase">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {plans.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-[max(16px,env(safe-area-inset-left))]">
          <div className="bg-board text-board-ink">
            <div className="h-2.5 bg-[repeating-linear-gradient(-45deg,var(--tape)_0_12px,transparent_12px_24px)]" aria-hidden="true" />
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.6fr]">
              <div>
                <p className="eyebrow text-tape">Membership</p>
                <h2 className="sign mt-2 text-5xl">From {money(cheapest).replace(".00", "")} a month</h2>
                <p className="mt-3 text-sm leading-relaxed opacity-75">Change or cancel any time from your dashboard.</p>
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex h-10 items-center bg-tape px-4 font-display text-[1.05rem] font-bold tracking-wide text-tape-ink uppercase hover:bg-paper hover:text-ink"
                >
                  Compare plans
                </Link>
              </div>
              <ul className="grid gap-6 sm:grid-cols-3">
                {plans.map((p) => (
                  <li key={p.id} className="border-t border-paper/25 pt-4">
                    <p className="font-display text-3xl font-bold uppercase">{p.name}</p>
                    <p className="mt-1 font-mono text-xs text-tape tabular">{money(p.monthlyPrice)} / mo</p>
                    <p className="mt-3 text-sm opacity-75">{p.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
