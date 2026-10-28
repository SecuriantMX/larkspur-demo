"use client";

import { useState } from "react";
import { TicketThread, ticketLabel, ticketTone } from "@/components/ticket-thread";
import { useToast } from "@/components/toast";
import { Badge, Button, EmptyState, Field, FormError, Input, Modal, PageHeader, Panel, Textarea, cx } from "@/components/ui";
import { relative } from "@/lib/format";
import { createTicket, useAuthed } from "@/lib/store";

export default function SupportPage() {
  const session = useAuthed();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;
  const { state, user } = session;
  const tickets = state.tickets.filter((t) => t.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0];

  function submit() {
    const result = createTicket({ subject, body });
    if (!result.ok) return setError(result.error);
    setComposing(false);
    setSubject("");
    setBody("");
    setError(null);
    setSelectedId(result.id ?? null);
    toast("Request sent. We usually reply within one business day.");
  }

  return (
    <>
      <PageHeader
        title="Support"
        description="Questions about bookings, billing or the building. Replies also arrive by email."
        action={<Button onClick={() => setComposing(true)}>New request</Button>}
      />

      {tickets.length ? (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-line">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={cx("flex w-full flex-col gap-1 px-4 py-3 text-left", selected?.id === t.id ? "bg-accent-soft" : "hover:bg-sunken")}
                  >
                    <span className="truncate text-sm font-medium">{t.subject}</span>
                    <span className="flex items-center justify-between gap-2 text-xs text-ink-soft">
                      {relative(t.updatedAt)}
                      <Badge tone={ticketTone[t.status]}>{t.status === "pending" ? "Replied" : ticketLabel[t.status]}</Badge>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-5">{selected && <TicketThread key={selected.id} ticket={selected} />}</Panel>
        </div>
      ) : (
        <Panel>
          <EmptyState
            title="No support requests"
            body="If something isn't right with a booking, an invoice or the building, open a request and the front desk will pick it up."
            action={<Button size="sm" onClick={() => setComposing(true)}>New request</Button>}
          />
        </Panel>
      )}

      <Modal
        open={composing}
        onClose={() => setComposing(false)}
        title="New support request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setComposing(false)}>
              Close
            </Button>
            <Button onClick={submit}>Send request</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Subject" htmlFor="ticket-subject">
            <Input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Charged twice for a booking" />
          </Field>
          <Field label="What happened?" htmlFor="ticket-body">
            <Textarea id="ticket-body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
          </Field>
          <FormError message={error} />
        </div>
      </Modal>
    </>
  );
}
