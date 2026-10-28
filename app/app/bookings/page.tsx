"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/toast";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  FormError,
  Input,
  Modal,
  PageHeader,
  Panel,
  Select,
  TableWrap,
  cx,
  td,
  th,
} from "@/components/ui";
import { money, timeRange } from "@/lib/format";
import { cancelBooking, createBooking, useAuthed } from "@/lib/store";

const START_HOURS = Array.from({ length: 12 }, (_, i) => 8 + i);

function tomorrowValue() {
  const d = new Date(Date.now() + 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingsPage() {
  const session = useAuthed();
  const toast = useToast();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [open, setOpen] = useState(false);
  const [spaceId, setSpaceId] = useState("");
  const [day, setDay] = useState(tomorrowValue);
  const [hour, setHour] = useState(10);
  const [hours, setHours] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new")) setOpen(true);
  }, []);

  const spaces = useMemo(() => session?.state.spaces.filter((s) => s.active) ?? [], [session?.state.spaces]);
  useEffect(() => {
    if (!spaceId && spaces[0]) setSpaceId(spaces[0].id);
  }, [spaces, spaceId]);

  if (!session) return null;
  const { state, user } = session;
  const now = Date.now();
  const mine = state.bookings.filter((b) => b.userId === user.id);
  const list =
    tab === "upcoming"
      ? mine.filter((b) => b.status === "confirmed" && Date.parse(b.end) > now).sort((a, b) => a.start.localeCompare(b.start))
      : mine.filter((b) => b.status === "cancelled" || Date.parse(b.end) <= now).sort((a, b) => b.start.localeCompare(a.start));
  const space = spaces.find((s) => s.id === spaceId);
  const spaceName = (id: string) => state.spaces.find((s) => s.id === id)?.name ?? "Space";

  function submit() {
    const [y, m, d] = day.split("-").map(Number);
    const start = new Date(y, m - 1, d, hour, 0, 0, 0);
    if (hour + hours > 20) return setError("The building closes at 8:00 pm. Pick an earlier start or fewer hours.");
    const result = createBooking(spaceId, start, hours);
    if (!result.ok) return setError(result.error);
    setError(null);
    setOpen(false);
    setTab("upcoming");
    toast(`${space?.name} booked. Confirmation sent to ${user.email}.`);
  }

  function cancel(id: string) {
    const result = cancelBooking(id);
    setConfirmId(null);
    if (!result.ok) return toast(result.error, "bad");
    toast(result.refunded ? "Booking cancelled and refunded." : "Booking cancelled. The front desk will review the charge.");
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Reserve rooms by the hour. Cancel at least 24 hours ahead for an automatic refund."
        action={<Button onClick={() => setOpen(true)}>New booking</Button>}
      />

      <div className="flex gap-1 border-b border-line" role="tablist">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "-mb-px border-b-2 px-3 py-2 text-sm capitalize",
              tab === t ? "border-accent font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {t === "past" ? "Past and cancelled" : "Upcoming"}
          </button>
        ))}
      </div>

      <Panel>
        {list.length ? (
          <TableWrap>
            <table className="w-full min-w-[36rem]">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Space</th>
                  <th className={th}>When</th>
                  <th className={cx(th, "text-right")}>Total</th>
                  <th className={th}>Status</th>
                  <th className={th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((b) => {
                  const past = Date.parse(b.end) <= now;
                  return (
                    <tr key={b.id}>
                      <td className={cx(td, "font-medium")}>{spaceName(b.spaceId)}</td>
                      <td className={cx(td, "text-ink-soft")}>{timeRange(b.start, b.end)}</td>
                      <td className={cx(td, "text-right tabular")}>{money(b.total)}</td>
                      <td className={td}>
                        {b.status === "cancelled" ? (
                          <Badge tone="bad">Cancelled</Badge>
                        ) : past ? (
                          <Badge>Completed</Badge>
                        ) : (
                          <Badge tone="good">Confirmed</Badge>
                        )}
                      </td>
                      <td className={cx(td, "text-right whitespace-nowrap")}>
                        {b.status === "confirmed" && !past &&
                          (confirmId === b.id ? (
                            <span className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="danger" onClick={() => cancel(b.id)}>
                                Confirm cancel
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                                Keep
                              </Button>
                            </span>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setConfirmId(b.id)}>
                              Cancel
                            </Button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <EmptyState
            title={tab === "upcoming" ? "No upcoming bookings" : "No past bookings yet"}
            body={tab === "upcoming" ? "Book a room and it will show up here." : "Completed and cancelled bookings appear here."}
            action={tab === "upcoming" ? <Button size="sm" onClick={() => setOpen(true)}>New booking</Button> : undefined}
          />
        )}
      </Panel>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        title="New booking"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={submit} disabled={!space}>
              Book and pay {space ? money(space.hourlyRate * hours) : ""}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Space" htmlFor="booking-space">
            <Select id="booking-space" value={spaceId} onChange={(e) => setSpaceId(e.target.value)}>
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · up to {s.capacity} · {money(s.hourlyRate)}/h
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date" htmlFor="booking-date">
              <Input id="booking-date" type="date" value={day} min={tomorrowValue()} onChange={(e) => setDay(e.target.value)} />
            </Field>
            <Field label="Start" htmlFor="booking-start">
              <Select id="booking-start" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                {START_HOURS.map((h) => (
                  <option key={h} value={h}>
                    {new Date(2000, 0, 1, h).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Hours" htmlFor="booking-hours">
              <Select id="booking-hours" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {[1, 2, 3, 4, 6, 8].map((h) => (
                  <option key={h} value={h}>
                    {h} h
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {space && <p className="text-sm text-ink-soft">{space.description}</p>}
          <p className="rounded-md bg-sunken px-3 py-2 text-xs text-ink-soft">
            Charged to the card on file. In this demo no real payment is taken; production uses Stripe.
          </p>
          <FormError message={error} />
        </div>
      </Modal>
    </>
  );
}
