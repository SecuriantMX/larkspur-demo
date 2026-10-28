"use client";

import { useState } from "react";
import { TicketThread, ticketTone } from "@/components/ticket-thread";
import { Badge, Button, EmptyState, PageHeader, Panel, cx } from "@/components/ui";
import { relative } from "@/lib/format";
import { setTicketStatus, useAuthed } from "@/lib/store";
import type { TicketStatus } from "@/lib/types";

const filters: Array<{ value: "all" | TicketStatus; label: string }> = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Waiting on member" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];
const statusLabel = { open: "Open", pending: "Waiting", closed: "Closed" } as const;

export default function AdminTickets() {
  const session = useAuthed();
  const [filter, setFilter] = useState<"all" | TicketStatus>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!session) return null;
  const { state } = session;
  const tickets = state.tickets
    .filter((t) => filter === "all" || t.status === filter)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0];
  const count = (s: TicketStatus) => state.tickets.filter((t) => t.status === s).length;

  return (
    <>
      <PageHeader title="Support inbox" description="Requests from member dashboards and the website contact form." />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value);
              setSelectedId(null);
            }}
            className={cx(
              "border-2 px-3 py-1 font-display text-base font-bold uppercase",
              filter === f.value ? "border-ink bg-tape text-tape-ink" : "border-line text-ink-soft hover:border-ink hover:text-ink",
            )}
          >
            {f.label}
            {f.value !== "all" && <span className="ml-1.5 tabular opacity-70">{count(f.value)}</span>}
          </button>
        ))}
      </div>

      {tickets.length ? (
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-line">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={cx(
                      "flex w-full flex-col gap-1 border-l-[6px] px-4 py-3 text-left",
                      selected?.id === t.id ? "border-tape bg-sunken" : "border-transparent hover:bg-sunken",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{t.name}</span>
                      <span className="shrink-0 text-xs text-ink-soft">{relative(t.updatedAt)}</span>
                    </span>
                    <span className="truncate text-sm">{t.subject}</span>
                    <span className="flex gap-1.5">
                      <Badge tone={ticketTone[t.status]}>{statusLabel[t.status]}</Badge>
                      {t.source === "contact form" && <Badge>Website</Badge>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          {selected && (
            <Panel className="flex flex-col gap-4 p-5">
              <div className="flex flex-wrap justify-end gap-2">
                {selected.status !== "closed" ? (
                  <Button size="sm" variant="secondary" onClick={() => setTicketStatus(selected.id, "closed")}>
                    Close request
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setTicketStatus(selected.id, "open")}>
                    Reopen
                  </Button>
                )}
              </div>
              <TicketThread key={selected.id} ticket={selected} staffView />
              {!selected.userId && (
                <p className="border-l-4 border-tape bg-sunken px-3 py-2 text-xs text-ink-soft">
                  Sent from the website by someone without an account. Replies go to {selected.email}.
                </p>
              )}
            </Panel>
          )}
        </div>
      ) : (
        <Panel>
          <EmptyState title="Inbox zero" body="No requests in this view." />
        </Panel>
      )}
    </>
  );
}
