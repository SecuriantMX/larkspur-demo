"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/components/toast";
import { Badge, Button, EmptyState, PageHeader, Panel, Select, TableWrap, cx, td, th } from "@/components/ui";
import { date, downloadCsv, money } from "@/lib/format";
import { adminRefund, useAuthed } from "@/lib/store";

const PAGE = 25;

export default function AdminPayments() {
  const session = useAuthed();
  const toast = useToast();
  const [kind, setKind] = useState<"all" | "subscription" | "booking">("all");
  const [status, setStatus] = useState<"all" | "paid" | "refunded">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  if (!session) return null;
  const { state } = session;
  const users = new Map(state.users.map((u) => [u.id, u]));
  const now = Date.now();
  const all = state.payments.filter((p) => Date.parse(p.createdAt) <= now);
  const list = all
    .filter((p) => (kind === "all" || p.kind === kind) && (status === "all" || p.status === status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const gross = all.reduce((s, p) => s + p.amount, 0);
  const refunded = all.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  function refund(id: string) {
    const result = adminRefund(id);
    setConfirmId(null);
    toast(result.ok ? "Refund issued. The member has been notified." : result.error, result.ok ? "good" : "bad");
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every charge from memberships and bookings, with refunds."
        action={
          <Button
            variant="secondary"
            disabled={!list.length}
            onClick={() =>
              downloadCsv(
                "payments.csv",
                list.map((p) => ({
                  invoice: p.invoiceNumber,
                  date: p.createdAt,
                  customer: users.get(p.userId)?.email ?? "",
                  type: p.kind,
                  description: p.description,
                  amount_usd: (p.amount / 100).toFixed(2),
                  status: p.status,
                  refunded_at: p.refundedAt ?? "",
                })),
              )
            }
          >
            <Download size={16} /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Gross charged", value: money(gross) },
          { label: "Refunded", value: money(refunded) },
          { label: "Net", value: money(gross - refunded) },
        ].map((k) => (
          <Panel key={k.label} className="p-5">
            <p className="text-xs font-medium tracking-wide text-ink-soft uppercase">{k.label}</p>
            <p className="tabular mt-1 font-display text-2xl font-semibold">{k.value}</p>
          </Panel>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <label htmlFor="pay-kind" className="sr-only">
          Type
        </label>
        <Select id="pay-kind" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="w-auto">
          <option value="all">All types</option>
          <option value="subscription">Memberships</option>
          <option value="booking">Bookings</option>
        </Select>
        <label htmlFor="pay-status" className="sr-only">
          Status
        </label>
        <Select id="pay-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-auto">
          <option value="all">Any status</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </Select>
      </div>

      <Panel>
        {list.length ? (
          <>
            <TableWrap>
              <table className="w-full min-w-[50rem]">
                <thead className="border-b border-line">
                  <tr>
                    <th className={th}>Invoice</th>
                    <th className={th}>Date</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Description</th>
                    <th className={cx(th, "text-right")}>Amount</th>
                    <th className={th}>Status</th>
                    <th className={th}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {list.slice(0, limit).map((p) => (
                    <tr key={p.id}>
                      <td className={cx(td, "font-mono")}>{p.invoiceNumber}</td>
                      <td className={cx(td, "text-ink-soft whitespace-nowrap")}>{date(p.createdAt)}</td>
                      <td className={td}>{users.get(p.userId)?.name ?? "Deleted user"}</td>
                      <td className={td}>{p.description}</td>
                      <td className={cx(td, "text-right tabular")}>{money(p.amount)}</td>
                      <td className={td}>{p.status === "paid" ? <Badge tone="good">Paid</Badge> : <Badge tone="warn">Refunded</Badge>}</td>
                      <td className={cx(td, "text-right whitespace-nowrap")}>
                        {p.status === "paid" &&
                          (confirmId === p.id ? (
                            <span className="flex justify-end gap-2">
                              <Button size="sm" variant="danger" onClick={() => refund(p.id)}>
                                Refund {money(p.amount)}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                                Keep
                              </Button>
                            </span>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setConfirmId(p.id)}>
                              Refund
                            </Button>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            {list.length > limit && (
              <div className="border-t border-line px-5 py-3">
                <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
                  Show more ({list.length - limit} left)
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="No payments match" body="Change the filters to see more." />
        )}
      </Panel>
    </>
  );
}
