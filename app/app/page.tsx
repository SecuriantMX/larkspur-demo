"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, ButtonLink, EmptyState, PageHeader, Panel, PanelHeader } from "@/components/ui";
import { money, relative, timeRange } from "@/lib/format";
import { useAuthed } from "@/lib/store";

export default function MemberOverview() {
  const session = useAuthed();
  if (!session) return null;
  const { state, user } = session;

  const now = Date.now();
  const upcoming = state.bookings
    .filter((b) => b.userId === user.id && b.status === "confirmed" && Date.parse(b.end) > now)
    .sort((a, b) => a.start.localeCompare(b.start));
  const plan = state.plans.find((p) => p.id === user.planId);
  const openTickets = state.tickets.filter((t) => t.userId === user.id && t.status !== "closed");
  const notes = state.notifications.filter((n) => n.userId === user.id).slice(0, 4);
  const spaceName = (id: string) => state.spaces.find((s) => s.id === id)?.name ?? "Space";
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi, ${firstName}`}
        description="Your bookings, membership and support requests."
        action={<ButtonLink href="/app/bookings?new=1">Book a space</ButtonLink>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <p className="eyebrow text-ink-soft">Next booking</p>
          {upcoming[0] ? (
            <>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase">{spaceName(upcoming[0].spaceId)}</p>
              <p className="text-sm text-ink-soft">{timeRange(upcoming[0].start, upcoming[0].end)}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Nothing booked yet.</p>
          )}
        </Panel>
        <Panel className="p-5">
          <p className="eyebrow text-ink-soft">Membership</p>
          <p className="mt-2 font-display text-3xl font-extrabold uppercase">{plan?.name ?? "Pay as you go"}</p>
          <p className="text-sm text-ink-soft">{plan ? `${money(plan.monthlyPrice)} / month` : "Hourly rates apply"}</p>
        </Panel>
        <Panel className="p-5">
          <p className="eyebrow text-ink-soft">Open support requests</p>
          <p className="mt-2 font-stencil text-5xl leading-none tabular">{openTickets.length}</p>
          <Link href="/app/support" className="text-sm text-accent">
            Go to support
          </Link>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeader
            title="Upcoming bookings"
            action={
              <Link href="/app/bookings" className="flex items-center gap-1 text-sm text-accent">
                All bookings <ArrowRight size={14} />
              </Link>
            }
          />
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 4).map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{spaceName(b.spaceId)}</p>
                    <p className="text-sm text-ink-soft">{timeRange(b.start, b.end)}</p>
                  </div>
                  <span className="tabular text-sm">{money(b.total)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No upcoming bookings"
              body="Reserve a meeting room, studio or desk for the hours you need."
              action={<ButtonLink href="/app/bookings?new=1" size="sm">Book a space</ButtonLink>}
            />
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="Recent notifications"
            action={
              <Link href="/app/notifications" className="text-sm text-accent">
                View all
              </Link>
            }
          />
          {notes.length ? (
            <ul className="divide-y divide-line">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-ink-soft">{n.body}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-ink-soft">{relative(n.createdAt)}</span>
                    {!n.read && <Badge tone="accent">New</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="All caught up" body="Booking confirmations, receipts and support replies show up here." />
          )}
        </Panel>
      </div>
    </>
  );
}
