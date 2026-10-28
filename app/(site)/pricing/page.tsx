"use client";

import { Check } from "lucide-react";
import { ButtonLink, cx } from "@/components/ui";
import { money } from "@/lib/format";
import { usePublicData } from "@/lib/use-content";

export default function PricingPage() {
  const { plans, user } = usePublicData();
  const featured = plans.length > 1 ? plans[1].id : null;

  return (
    <div className="mx-auto max-w-6xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Memberships</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Monthly plans billed to your card. Switch or cancel from Billing whenever you need to. No membership? Book rooms at the hourly rate.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <article
            key={p.id}
            className={cx(
              "flex flex-col rounded-lg border bg-surface p-6",
              p.id === featured ? "border-accent ring-1 ring-accent" : "border-line",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">{p.name}</h2>
              {p.id === featured && <span className="text-xs font-medium text-accent">Most chosen</span>}
            </div>
            <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
            <p className="mt-5">
              <span className="tabular font-display text-4xl font-semibold">{money(p.monthlyPrice).replace(".00", "")}</span>
              <span className="text-sm text-ink-soft"> / month</span>
            </p>
            <ul className="mt-5 flex flex-col gap-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-good" />
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink
              href={user ? "/app/billing" : "/signup"}
              variant={p.id === featured ? "primary" : "secondary"}
              className="mt-8"
            >
              {user ? `Switch to ${p.name}` : `Start with ${p.name}`}
            </ButtonLink>
          </article>
        ))}
      </div>
    </div>
  );
}
