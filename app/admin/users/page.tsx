"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
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
import { date, downloadCsv, initials, money, relative } from "@/lib/format";
import { adminUpdateUser, useAuthed } from "@/lib/store";
import type { Role, User, UserStatus } from "@/lib/types";

export default function AdminUsers() {
  const session = useAuthed();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [status, setStatus] = useState<"all" | UserStatus>("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [draft, setDraft] = useState<{ name: string; company: string; role: Role; status: UserStatus }>({
    name: "",
    company: "",
    role: "member",
    status: "active",
  });
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;
  const { state } = session;
  const plans = new Map(state.plans.map((p) => [p.id, p]));
  const spentBy = new Map<string, number>();
  for (const p of state.payments) if (p.status === "paid") spentBy.set(p.userId, (spentBy.get(p.userId) ?? 0) + p.amount);

  const q = query.trim().toLowerCase();
  const users = state.users
    .filter((u) => (role === "all" || u.role === role) && (status === "all" || u.status === status))
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q) || u.company.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function openEditor(u: User) {
    setEditing(u);
    setDraft({ name: u.name, company: u.company, role: u.role, status: u.status });
    setError(null);
  }

  function save() {
    if (!editing) return;
    const result = adminUpdateUser(editing.id, draft);
    if (!result.ok) return setError(result.error);
    setEditing(null);
    toast(`${draft.name} updated.`);
  }

  function exportCsv() {
    downloadCsv(
      "users.csv",
      users.map((u) => ({
        name: u.name,
        email: u.email,
        company: u.company,
        role: u.role,
        status: u.status,
        plan: u.planId ? plans.get(u.planId)?.name ?? "" : "",
        sign_in: u.provider,
        joined: u.createdAt,
        lifetime_paid_usd: ((spentBy.get(u.id) ?? 0) / 100).toFixed(2),
      })),
    );
  }

  return (
    <>
      <PageHeader
        title="Users"
        description={`${state.users.length} accounts. Edit roles, suspend access and export the list.`}
        action={
          <Button variant="secondary" onClick={exportCsv} disabled={!users.length}>
            <Download size={16} /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <Input id="user-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or company" className="pl-9" />
        </div>
        <label htmlFor="user-role" className="sr-only">
          Role
        </label>
        <Select id="user-role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="w-auto">
          <option value="all">All roles</option>
          <option value="member">Members</option>
          <option value="admin">Admins</option>
        </Select>
        <label htmlFor="user-status" className="sr-only">
          Status
        </label>
        <Select id="user-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-auto">
          <option value="all">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <Panel>
        {users.length ? (
          <TableWrap>
            <table className="w-full min-w-[52rem]">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>User</th>
                  <th className={th}>Plan</th>
                  <th className={th}>Role</th>
                  <th className={th}>Status</th>
                  <th className={cx(th, "text-right")}>Lifetime paid</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Last seen</th>
                  <th className={th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id} className={cx(u.status === "suspended" && "opacity-70")}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-semibold">
                          {initials(u.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-ink-soft">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{u.planId ? plans.get(u.planId)?.name : <span className="text-ink-soft">None</span>}</td>
                    <td className={td}>{u.role === "admin" ? <Badge tone="accent">Admin</Badge> : <Badge>Member</Badge>}</td>
                    <td className={td}>{u.status === "active" ? <Badge tone="good">Active</Badge> : <Badge tone="bad">Suspended</Badge>}</td>
                    <td className={cx(td, "text-right tabular")}>{money(spentBy.get(u.id) ?? 0)}</td>
                    <td className={cx(td, "text-ink-soft whitespace-nowrap")}>{date(u.createdAt)}</td>
                    <td className={cx(td, "text-ink-soft whitespace-nowrap")}>{relative(u.lastSeenAt)}</td>
                    <td className={cx(td, "text-right")}>
                      <Button size="sm" variant="ghost" onClick={() => openEditor(u)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <EmptyState title="No users match" body="Try a different search or clear the filters." />
        )}
      </Panel>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : "Edit user"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Close
            </Button>
            <Button onClick={save}>Save user</Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">
              {editing.email} · signs in with {editing.provider === "google" ? "Google" : "email and password"}
            </p>
            <Field label="Name" htmlFor="edit-name">
              <Input id="edit-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Company" htmlFor="edit-company">
              <Input id="edit-company" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role" hint="Admins can open this panel." htmlFor="edit-role">
                <Select id="edit-role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field label="Status" hint="Suspended users can't sign in." htmlFor="edit-status">
                <Select id="edit-status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as UserStatus })}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </Field>
            </div>
            <FormError message={error} />
          </div>
        )}
      </Modal>
    </>
  );
}
