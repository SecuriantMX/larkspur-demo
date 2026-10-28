"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/toast";
import {
  Badge,
  Button,
  Field,
  FormError,
  Input,
  Modal,
  PageHeader,
  Panel,
  PanelHeader,
  Select,
  TableWrap,
  Textarea,
  cx,
  td,
  th,
} from "@/components/ui";
import { money } from "@/lib/format";
import { adminSavePlan, adminSaveSpace, uid, useAuthed } from "@/lib/store";
import type { Plan, Space, SpaceKind } from "@/lib/types";

const KINDS: SpaceKind[] = ["Meeting room", "Private office", "Studio", "Desk"];

type SpaceDraft = Omit<Space, "hourlyRate" | "capacity"> & { hourlyRate: string; capacity: string };
type PlanDraft = Omit<Plan, "monthlyPrice" | "features"> & { monthlyPrice: string; features: string };

const toDollars = (cents: number) => (cents / 100).toFixed(2);
const toCents = (value: string) => Math.round(Number(value) * 100);

export default function AdminCatalog() {
  const session = useAuthed();
  const toast = useToast();
  const [space, setSpace] = useState<SpaceDraft | null>(null);
  const [plan, setPlan] = useState<PlanDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;
  const { state } = session;
  const bookingsBySpace = new Map<string, number>();
  for (const b of state.bookings) if (b.status === "confirmed") bookingsBySpace.set(b.spaceId, (bookingsBySpace.get(b.spaceId) ?? 0) + 1);
  const membersByPlan = new Map<string, number>();
  for (const u of state.users) if (u.planId) membersByPlan.set(u.planId, (membersByPlan.get(u.planId) ?? 0) + 1);

  function editSpace(s?: Space) {
    setError(null);
    setSpace(
      s
        ? { ...s, hourlyRate: toDollars(s.hourlyRate), capacity: String(s.capacity) }
        : { id: uid("sp"), name: "", kind: "Meeting room", description: "", capacity: "4", hourlyRate: "30.00", active: true },
    );
  }

  function editPlan(p?: Plan) {
    setError(null);
    setPlan(
      p
        ? { ...p, monthlyPrice: toDollars(p.monthlyPrice), features: p.features.join("\n") }
        : { id: uid("pl"), name: "", description: "", monthlyPrice: "99.00", features: "", active: true },
    );
  }

  function saveSpace() {
    if (!space) return;
    const result = adminSaveSpace({ ...space, name: space.name.trim(), hourlyRate: toCents(space.hourlyRate), capacity: Number(space.capacity) || 0 });
    if (!result.ok) return setError(result.error);
    setSpace(null);
    toast(`${space.name} saved. The website and booking form are updated.`);
  }

  function savePlan() {
    if (!plan) return;
    const result = adminSavePlan({
      ...plan,
      name: plan.name.trim(),
      monthlyPrice: toCents(plan.monthlyPrice),
      features: plan.features.split("\n").map((f) => f.trim()).filter(Boolean),
    });
    if (!result.ok) return setError(result.error);
    setPlan(null);
    toast(`${plan.name} saved. Pricing page updated.`);
  }

  return (
    <>
      <PageHeader title="Spaces & plans" description="What members can book and subscribe to. Changes publish to the website immediately." />

      <Panel>
        <PanelHeader
          title="Bookable spaces"
          action={
            <Button size="sm" variant="secondary" onClick={() => editSpace()}>
              <Plus size={14} /> Add space
            </Button>
          }
        />
        <TableWrap>
          <table className="w-full min-w-[40rem]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Space</th>
                <th className={th}>Type</th>
                <th className={cx(th, "text-right")}>Seats</th>
                <th className={cx(th, "text-right")}>Rate</th>
                <th className={cx(th, "text-right")}>Bookings</th>
                <th className={th}>Status</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {state.spaces.map((s) => (
                <tr key={s.id}>
                  <td className={cx(td, "font-medium")}>{s.name}</td>
                  <td className={cx(td, "text-ink-soft")}>{s.kind}</td>
                  <td className={cx(td, "text-right tabular")}>{s.capacity}</td>
                  <td className={cx(td, "text-right tabular")}>{money(s.hourlyRate)}/h</td>
                  <td className={cx(td, "text-right tabular")}>{bookingsBySpace.get(s.id) ?? 0}</td>
                  <td className={td}>{s.active ? <Badge tone="good">Bookable</Badge> : <Badge>Hidden</Badge>}</td>
                  <td className={cx(td, "text-right")}>
                    <Button size="sm" variant="ghost" onClick={() => editSpace(s)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Panel>

      <Panel>
        <PanelHeader
          title="Membership plans"
          action={
            <Button size="sm" variant="secondary" onClick={() => editPlan()}>
              <Plus size={14} /> Add plan
            </Button>
          }
        />
        <TableWrap>
          <table className="w-full min-w-[40rem]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Plan</th>
                <th className={cx(th, "text-right")}>Price</th>
                <th className={cx(th, "text-right")}>Members</th>
                <th className={th}>Status</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {state.plans.map((p) => (
                <tr key={p.id}>
                  <td className={td}>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-ink-soft">{p.description}</p>
                  </td>
                  <td className={cx(td, "text-right tabular")}>{money(p.monthlyPrice)}/mo</td>
                  <td className={cx(td, "text-right tabular")}>{membersByPlan.get(p.id) ?? 0}</td>
                  <td className={td}>{p.active ? <Badge tone="good">On sale</Badge> : <Badge>Retired</Badge>}</td>
                  <td className={cx(td, "text-right")}>
                    <Button size="sm" variant="ghost" onClick={() => editPlan(p)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Panel>

      <Modal
        open={!!space}
        onClose={() => setSpace(null)}
        title={space && state.spaces.some((s) => s.id === space.id) ? `Edit ${space.name}` : "Add a space"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSpace(null)}>
              Close
            </Button>
            <Button onClick={saveSpace}>Save space</Button>
          </>
        }
      >
        {space && (
          <div className="flex flex-col gap-4">
            <Field label="Name" htmlFor="space-name">
              <Input id="space-name" value={space.name} onChange={(e) => setSpace({ ...space, name: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Type" htmlFor="space-kind">
                <Select id="space-kind" value={space.kind} onChange={(e) => setSpace({ ...space, kind: e.target.value as SpaceKind })}>
                  {KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Seats" htmlFor="space-capacity">
                <Input id="space-capacity" type="number" min={1} value={space.capacity} onChange={(e) => setSpace({ ...space, capacity: e.target.value })} />
              </Field>
              <Field label="Rate (USD/h)" htmlFor="space-rate">
                <Input id="space-rate" type="number" min={1} step="0.01" value={space.hourlyRate} onChange={(e) => setSpace({ ...space, hourlyRate: e.target.value })} />
              </Field>
            </div>
            <Field label="Description" htmlFor="space-description">
              <Textarea id="space-description" value={space.description} onChange={(e) => setSpace({ ...space, description: e.target.value })} rows={3} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input id="space-active" type="checkbox" checked={space.active} onChange={(e) => setSpace({ ...space, active: e.target.checked })} />
              Bookable and shown on the website
            </label>
            <FormError message={error} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!plan}
        onClose={() => setPlan(null)}
        title={plan && state.plans.some((p) => p.id === plan.id) ? `Edit ${plan.name}` : "Add a plan"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPlan(null)}>
              Close
            </Button>
            <Button onClick={savePlan}>Save plan</Button>
          </>
        }
      >
        {plan && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field label="Name" htmlFor="plan-name">
                <Input id="plan-name" value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} />
              </Field>
              <Field label="Price (USD/mo)" htmlFor="plan-price">
                <Input id="plan-price" type="number" min={1} step="0.01" value={plan.monthlyPrice} onChange={(e) => setPlan({ ...plan, monthlyPrice: e.target.value })} />
              </Field>
            </div>
            <Field label="Short description" htmlFor="plan-description">
              <Input id="plan-description" value={plan.description} onChange={(e) => setPlan({ ...plan, description: e.target.value })} />
            </Field>
            <Field label="Features" hint="One per line. Shown as a checklist on the pricing page." htmlFor="plan-features">
              <Textarea id="plan-features" value={plan.features} onChange={(e) => setPlan({ ...plan, features: e.target.value })} rows={5} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input id="plan-active" type="checkbox" checked={plan.active} onChange={(e) => setPlan({ ...plan, active: e.target.checked })} />
              On sale. Retired plans stay on existing members&apos; accounts.
            </label>
            <FormError message={error} />
          </div>
        )}
      </Modal>
    </>
  );
}
