"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/components/toast";
import { Badge, Button, EmptyState, Modal, PageHeader, Panel, PanelHeader, TableWrap, cx, td, th } from "@/components/ui";
import { date, money } from "@/lib/format";
import { changePlan, useAuthed } from "@/lib/store";
import type { Payment } from "@/lib/types";

export default function BillingPage() {
  const session = useAuthed();
  const toast = useToast();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [invoice, setInvoice] = useState<Payment | null>(null);
  const [processing, setProcessing] = useState(false);

  if (!session) return null;
  const { state, user } = session;
  const plans = state.plans.filter((p) => p.active);
  const current = state.plans.find((p) => p.id === user.planId) ?? null;
  const payments = state.payments.filter((p) => p.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const checkoutPlan = plans.find((p) => p.id === checkoutPlanId);

  function pay() {
    if (!checkoutPlan) return;
    setProcessing(true);
    // Short pause so the flow feels like the hosted checkout it stands in for.
    setTimeout(() => {
      const result = changePlan(checkoutPlan.id);
      setProcessing(false);
      setCheckoutPlanId(null);
      if (!result.ok) return toast(result.error, "bad");
      toast(`You're on ${checkoutPlan.name}. Receipt sent to ${user.email}.`);
    }, 900);
  }

  return (
    <>
      <PageHeader title="Billing" description="Your membership, payment history and invoices." />

      <Panel className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-ink-soft uppercase">Current plan</p>
          <p className="mt-1 font-display text-xl font-semibold">{current?.name ?? "Pay as you go"}</p>
          <p className="text-sm text-ink-soft">
            {current ? `${money(current.monthlyPrice)} billed monthly to Visa ending 4242` : "No membership. Rooms are billed per booking."}
          </p>
        </div>
        {current &&
          (confirmCancel ? (
            <div className="flex items-center gap-2 text-sm">
              Cancel {current.name}?
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  const r = changePlan(null);
                  setConfirmCancel(false);
                  if (r.ok) toast("Membership cancelled.");
                }}
              >
                Cancel plan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>
                Keep it
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirmCancel(true)}>
              Cancel membership
            </Button>
          ))}
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.id === user.planId;
          return (
            <Panel key={p.id} className={cx("flex flex-col p-5", isCurrent && "border-accent ring-1 ring-accent")}>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">{p.name}</p>
                {isCurrent && <Badge tone="accent">Current</Badge>}
              </div>
              <p className="tabular mt-1 text-sm text-ink-soft">{money(p.monthlyPrice)} / month</p>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-good" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5"
                variant={isCurrent ? "secondary" : "primary"}
                disabled={isCurrent}
                onClick={() => setCheckoutPlanId(p.id)}
              >
                {isCurrent ? "Your plan" : current ? `Switch to ${p.name}` : `Join ${p.name}`}
              </Button>
            </Panel>
          );
        })}
      </div>

      <Panel>
        <PanelHeader title="Invoices" />
        {payments.length ? (
          <TableWrap>
            <table className="w-full min-w-[34rem]">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Invoice</th>
                  <th className={th}>Date</th>
                  <th className={th}>Description</th>
                  <th className={cx(th, "text-right")}>Amount</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>
                      <button className="font-mono text-sm text-accent hover:underline" onClick={() => setInvoice(p)}>
                        {p.invoiceNumber}
                      </button>
                    </td>
                    <td className={cx(td, "text-ink-soft whitespace-nowrap")}>{date(p.createdAt)}</td>
                    <td className={td}>{p.description}</td>
                    <td className={cx(td, "text-right tabular")}>{money(p.amount)}</td>
                    <td className={td}>{p.status === "paid" ? <Badge tone="good">Paid</Badge> : <Badge tone="warn">Refunded</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <EmptyState title="No invoices yet" body="Invoices appear here after your first booking or membership payment." />
        )}
      </Panel>

      <Modal
        open={!!checkoutPlan}
        onClose={() => !processing && setCheckoutPlanId(null)}
        title="Checkout"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckoutPlanId(null)} disabled={processing}>
              Back
            </Button>
            <Button onClick={pay} disabled={processing}>
              {processing ? "Processing…" : `Pay ${checkoutPlan ? money(checkoutPlan.monthlyPrice) : ""}`}
            </Button>
          </>
        }
      >
        {checkoutPlan && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-baseline justify-between">
              <span>{checkoutPlan.name} membership, monthly</span>
              <span className="tabular font-semibold">{money(checkoutPlan.monthlyPrice)}</span>
            </div>
            <div className="rounded-md border border-line p-3">
              <p className="text-xs text-ink-soft">Payment method</p>
              <p className="mt-1 font-mono">Visa •••• 4242 · exp 08/29</p>
            </div>
            <p className="rounded-md bg-sunken px-3 py-2 text-xs text-ink-soft">
              Test mode. In production this step is Stripe Checkout and the plan changes when Stripe confirms the payment by webhook.
            </p>
          </div>
        )}
      </Modal>

      <Modal open={!!invoice} onClose={() => setInvoice(null)} title={invoice ? `Invoice ${invoice.invoiceNumber}` : "Invoice"}>
        {invoice && (
          <div className="flex flex-col gap-5 text-sm">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-display text-lg font-semibold">{state.content.siteName}</p>
                <p className="text-ink-soft">{state.content.address}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">{invoice.invoiceNumber}</p>
                <p className="text-ink-soft">{date(invoice.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-ink-soft">Billed to</p>
              <p className="font-medium">{user.name}</p>
              {user.company && <p>{user.company}</p>}
              <p>{user.email}</p>
            </div>
            <table className="w-full">
              <tbody>
                <tr className="border-y border-line">
                  <td className="py-2">{invoice.description}</td>
                  <td className="py-2 text-right tabular">{money(invoice.amount)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Total</td>
                  <td className="py-2 text-right font-semibold tabular">{money(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-ink-soft">
              {invoice.status === "paid" ? "Paid by Visa ending 4242." : `Refunded on ${date(invoice.refundedAt ?? invoice.createdAt)}.`}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
