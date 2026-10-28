"use client";

import Link from "next/link";
import { BarChart } from "@/components/bar-chart";
import { Badge, PageHeader, Panel, PanelHeader } from "@/components/ui";
import { money, moneyShort, relative } from "@/lib/format";
import { useAuthed } from "@/lib/store";

const DAY = 86_400_000;

export default function AdminAnalytics() {
  const session = useAuthed();
  if (!session) return null;
  const { state } = session;

  const now = Date.now();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();

  const members = state.users.filter((u) => u.role === "member");
  const newIn = (days: number, offset = 0) =>
    members.filter((u) => {
      const t = Date.parse(u.createdAt);
      return t > now - (days + offset) * DAY && t <= now - offset * DAY;
    }).length;
  const signups30 = newIn(30);
  const signupsPrev30 = newIn(30, 30);

  const paid = state.payments.filter((p) => p.status === "paid" && Date.parse(p.createdAt) <= now);
  const revenueIn = (days: number, offset = 0) =>
    paid
      .filter((p) => {
        const t = Date.parse(p.createdAt);
        return t > now - (days + offset) * DAY && t <= now - offset * DAY;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  const revenue30 = revenueIn(30);
  const revenuePrev30 = revenueIn(30, 30);

  const planPrice = new Map(state.plans.map((p) => [p.id, p.monthlyPrice]));
  const mrr = members.filter((u) => u.planId && u.status === "active").reduce((s, u) => s + (planPrice.get(u.planId!) ?? 0), 0);
  const openTickets = state.tickets.filter((t) => t.status === "open").length;

  const signupSeries = Array.from({ length: 30 }, (_, i) => {
    const dayStart = today - (29 - i) * DAY;
    const d = new Date(dayStart);
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: members.filter((u) => {
        const t = Date.parse(u.createdAt);
        return t >= dayStart && t < dayStart + DAY;
      }).length,
    };
  });

  const revenueSeries = Array.from({ length: 12 }, (_, i) => {
    const end = today + DAY - (11 - i) * 7 * DAY;
    const start = end - 7 * DAY;
    const d = new Date(start);
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: paid.filter((p) => Date.parse(p.createdAt) >= start && Date.parse(p.createdAt) < end).reduce((s, p) => s + p.amount, 0),
    };
  });

  const planMix = state.plans.map((p) => ({
    plan: p,
    count: members.filter((u) => u.planId === p.id && u.status === "active").length,
  }));
  const subscribed = planMix.reduce((s, x) => s + x.count, 0);

  const delta = (cur: number, prev: number) => {
    if (!prev) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return <Badge tone={pct >= 0 ? "good" : "bad"}>{`${pct >= 0 ? "+" : ""}${pct}% vs prior 30 d`}</Badge>;
  };

  const kpis = [
    { label: "Members", value: String(members.length), note: `${members.filter((u) => u.status === "suspended").length} suspended` },
    { label: "New sign-ups, 30 d", value: String(signups30), badge: delta(signups30, signupsPrev30) },
    { label: "Revenue, 30 d", value: money(revenue30), badge: delta(revenue30, revenuePrev30) },
    { label: "Monthly recurring", value: money(mrr), note: `${subscribed} active memberships` },
  ];

  return (
    <>
      <PageHeader title="Analytics" description="Sign-ups, revenue and support load across the portal." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Panel key={k.label} className="flex flex-col gap-1 p-5">
            <p className="text-xs font-medium tracking-wide text-ink-soft uppercase">{k.label}</p>
            <p className="tabular font-display text-2xl font-semibold">{k.value}</p>
            <div className="text-xs text-ink-soft">{k.badge ?? k.note}</div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Daily sign-ups, last 30 days" />
          <div className="p-4">
            <BarChart title="Daily sign-ups over the last 30 days" data={signupSeries} labelEvery={5} integer />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Weekly revenue, last 12 weeks" />
          <div className="p-4">
            <BarChart title="Weekly revenue over the last 12 weeks" data={revenueSeries} format={(v) => moneyShort(v)} labelEvery={2} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel>
          <PanelHeader title="Membership mix" />
          <ul className="flex flex-col gap-4 p-5">
            {planMix.map(({ plan, count }) => (
              <li key={plan.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span>{plan.name}</span>
                  <span className="tabular text-ink-soft">
                    {count} · {money(count * plan.monthlyPrice)}/mo
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sunken">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${subscribed ? (count / subscribed) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-3 text-sm text-ink-soft">
              <span>Pay as you go</span>
              <span className="tabular">{members.length - subscribed}</span>
            </li>
          </ul>
        </Panel>

        <Panel>
          <PanelHeader
            title="Latest activity"
            action={
              <Link href="/admin/activity" className="text-sm text-accent">
                Full log
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {state.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p>
                    <span className="font-medium">{a.actorName}</span> <span className="text-ink-soft">{a.action.toLowerCase()}</span>
                  </p>
                  <p className="truncate text-ink-soft">{a.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-soft">{relative(a.createdAt)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-5 py-3 text-sm">
            <Link href="/admin/tickets" className="text-accent">
              {openTickets} open support {openTickets === 1 ? "request" : "requests"}
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
