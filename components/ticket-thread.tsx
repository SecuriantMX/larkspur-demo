"use client";

import { useState } from "react";
import { dateTime } from "@/lib/format";
import { replyToTicket } from "@/lib/store";
import type { Ticket } from "@/lib/types";
import { useToast } from "./toast";
import { Badge, Button, FormError, Textarea, cx } from "./ui";

export const ticketTone = { open: "accent", pending: "warn", closed: "neutral" } as const;
export const ticketLabel = { open: "Open", pending: "Replied", closed: "Closed" } as const;

export function TicketThread({ ticket, staffView = false }: { ticket: Ticket; staffView?: boolean }) {
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  function send() {
    const result = replyToTicket(ticket.id, reply);
    if (!result.ok) return setError(result.error);
    setReply("");
    setError(null);
    toast(staffView ? `Reply sent to ${ticket.email}.` : "Message added to your request.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">{ticket.subject}</h2>
          <p className="text-sm text-ink-soft">
            {ticket.name} · {ticket.email} · via {ticket.source}
          </p>
        </div>
        <Badge tone={ticketTone[ticket.status]}>{ticket.status === "pending" ? (staffView ? "Waiting on member" : "Replied") : ticketLabel[ticket.status]}</Badge>
      </div>

      <ol className="flex flex-col gap-3">
        {ticket.messages.map((m) => (
          <li
            key={m.id}
            className={cx(
              "max-w-[85%] rounded-lg px-4 py-3 text-sm",
              m.fromStaff ? "self-start bg-sunken" : "self-end bg-accent-soft",
            )}
          >
            <p className="mb-1 text-xs text-ink-soft">
              {m.authorName}
              {m.fromStaff && " · Front desk"} · {dateTime(m.createdAt)}
            </p>
            <p className="leading-relaxed whitespace-pre-line">{m.body}</p>
          </li>
        ))}
      </ol>

      {ticket.status !== "closed" || staffView ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={`reply-${ticket.id}`} className="sr-only">
            Reply
          </label>
          <Textarea
            id={`reply-${ticket.id}`}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={staffView ? `Reply to ${ticket.name.split(" ")[0]}…` : "Add a message…"}
            rows={3}
          />
          <FormError message={error} />
          <Button onClick={send} className="self-end" disabled={!reply.trim()}>
            {staffView ? "Send reply" : "Send"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-ink-soft">This request is closed. Open a new one if you need more help.</p>
      )}
    </div>
  );
}
