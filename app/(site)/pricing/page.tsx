"use client";

import { ButtonLink, cx } from "@/components/ui";
import { money } from "@/lib/format";
import { usePublicData } from "@/lib/use-content";

export default function PricingPage() {
  const { plans, user } = usePublicData();
  const featured = plans.length > 1 ? plans[1].id : null;

  return (
    <div className="mx-auto max-w-7xl px-[max(16px,env(safe-area-inset-left))] pt-12">
      <div className="grid gap-6 border-b-2 border-ink pb-6 lg:grid-cols-[1fr_24rem] lg:items-end">
        <h1 className="sign text-6xl sm:text-8xl">Membership</h1>
        <p className="text-ink-soft">
          Monthly, billed to your card. Switch or cancel from Billing whenever you need to. Not ready to join? Book rooms at the posted hourly rate.
        </p>
      </div>

      <div className="mt-10 grid border-2 border-ink md:grid-cols-3">
        {plans.map((p) => {
          const hot = p.id === featured;
          return (
            <article
              key={p.id}
              className={cx(
                "relative flex flex-col p-6 not-last:border-b-2 md:not-last:border-r-2 md:not-last:border-b-0 border-ink",
                hot ? "bg-board text-board-ink" : "bg-surface",
              )}
            >
              {hot && (
                <span className="absolute -top-3 left-6 bg-tape px-2 py-0.5 font-mono text-[0.625rem] text-tape-ink uppercase">
                  Most members pick this
                </span>
              )}
              <h2 className="font-display text-5xl leading-none font-extrabold uppercase">{p.name}</h2>
              <p className={cx("mt-2 text-sm", hot ? "opacity-75" : "text-ink-soft")}>{p.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-stencil text-7xl leading-none tabular">{money(p.monthlyPrice).replace(".00", "")}</span>
                <span className="font-mono text-xs opacity-70">/MO</span>
              </p>
              <ul className={cx("mt-6 flex flex-col border-t", hot ? "border-paper/25" : "border-line")}>
                {p.features.map((f) => (
                  <li key={f} className={cx("flex gap-3 border-b py-2 text-sm", hot ? "border-paper/25" : "border-line")}>
                    <span className={cx("font-mono", hot ? "text-tape" : "text-ink-soft")} aria-hidden="true">
                      +
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={user ? "/app/billing" : "/signup"}
                variant={hot ? "tape" : "secondary"}
                className="mt-8"
              >
                {user?.planId === p.id ? "Your current plan" : user ? `Switch to ${p.name}` : `Start with ${p.name}`}
              </ButtonLink>
            </article>
          );
        })}
      </div>
    </div>
  );
}
