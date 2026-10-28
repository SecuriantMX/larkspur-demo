"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AvailabilityBoard } from "@/components/availability-board";
import { ButtonLink } from "@/components/ui";
import { money } from "@/lib/format";
import { usePublicData } from "@/lib/use-content";

const steps = [
  { title: "Create an account", body: "Email or Google. No card needed until you book or join." },
  { title: "Choose how you pay", body: "Join a monthly membership, or pay per hour at the listed rate." },
  { title: "Book and show up", body: "Reserve a room for the hours you need. Your invoice lands in Billing." },
];

export default function HomePage() {
  const { content, spaces, plans, user } = usePublicData();

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-[max(16px,env(safe-area-inset-left))] pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="flex min-w-0 flex-col gap-5">
          <p className="font-mono text-xs tracking-wide text-brick uppercase">{content.heroEyebrow}</p>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">{content.heroTitle}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft">{content.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={user ? "/app/bookings" : "/signup"} size="lg">
              {user ? "Book a space" : "Create a free account"}
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary" size="lg">
              See memberships
            </ButtonLink>
          </div>
        </div>
        <AvailabilityBoard />
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-[max(16px,env(safe-area-inset-left))] py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Spaces you can book by the hour</h2>
            <Link href="/services" className="flex items-center gap-1 text-sm font-medium text-accent">
              All spaces and rates <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {spaces.slice(0, 3).map((s) => (
              <article key={s.id} className="flex flex-col gap-2 bg-surface p-5">
                <p className="font-mono text-xs text-ink-soft uppercase">{s.kind} · up to {s.capacity}</p>
                <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{s.description}</p>
                <p className="mt-auto pt-2 text-sm">
                  <span className="tabular font-semibold">{money(s.hourlyRate)}</span>
                  <span className="text-ink-soft"> / hour</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-[max(16px,env(safe-area-inset-left))] py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">How booking works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-display text-3xl font-semibold text-brick tabular">{i + 1}</span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-[max(16px,env(safe-area-inset-left))]">
        <div className="grid gap-8 rounded-lg bg-ink px-6 py-10 text-paper sm:px-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Memberships from {money(Math.min(...plans.map((p) => p.monthlyPrice)))} a month</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-80">Change or cancel any time from your dashboard. Invoices are emailed and kept in Billing.</p>
            <ButtonLink href="/pricing" className="mt-6 bg-paper text-ink">
              Compare plans
            </ButtonLink>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {plans.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 border-t border-paper/20 pt-4">
                <p className="font-semibold">{p.name}</p>
                <p className="tabular text-sm opacity-80">{money(p.monthlyPrice)} / mo</p>
                <p className="flex items-start gap-1.5 text-sm opacity-80">
                  <Check size={14} className="mt-0.5 shrink-0" /> {p.features[0]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
