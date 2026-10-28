"use client";

import { useSyncExternalStore } from "react";
import { createSeed, STATE_VERSION } from "./seed";
import type {
  ActivityEntry,
  Booking,
  Notification,
  Payment,
  Plan,
  Role,
  SiteContent,
  Space,
  State,
  Ticket,
  TicketStatus,
  User,
} from "./types";

// Demo persistence: the whole state lives in localStorage so the portal works with no backend.
// Every write goes through `commit`, which is the single seam to replace with Supabase calls.
const STORAGE_KEY = "larkspur-portal-state";

let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {
    // Storage blocked or corrupted: start from a fresh seed.
  }
  return createSeed();
}

function persist(next: State) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota or privacy mode. The session keeps working in memory.
  }
}

export function getState(): State {
  if (!state) {
    state = load();
    persist(state);
  }
  return state;
}

function commit(next: State) {
  state = next;
  persist(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    state = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns null during server render and hydration, then the live state. */
export function useStore(): State | null {
  return useSyncExternalStore(subscribe, getState, () => null);
}

export function useSession(): { state: State | null; user: User | null } {
  const s = useStore();
  const user = s?.sessionUserId ? s.users.find((u) => u.id === s.sessionUserId) ?? null : null;
  return { state: s, user };
}

/** For pages inside the dashboard shell, which has already checked the session. */
export function useAuthed(): { state: State; user: User } | null {
  const { state, user } = useSession();
  return state && user ? { state, user } : null;
}

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

function withActivity(s: State, actor: User | null, action: string, detail: string, guestName?: string): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: uid("ac"),
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? (guestName ? `${guestName} (website)` : "Guest"),
    action,
    detail,
    createdAt: now(),
  };
  return [entry, ...s.activity].slice(0, 500);
}

function withNotification(s: State, userId: string, title: string, body: string, href: string | null): Notification[] {
  const n: Notification = { id: uid("nt"), userId, title, body, href, read: false, emailed: true, createdAt: now() };
  return [n, ...s.notifications];
}

function nextInvoiceNumber(s: State) {
  const max = s.payments.reduce((m, p) => Math.max(m, Number(p.invoiceNumber.slice(3)) || 0), 1000);
  return `LS-${max + 1}`;
}

function currentUser(s: State) {
  return s.users.find((u) => u.id === s.sessionUserId) ?? null;
}

type Result = { ok: true } | { ok: false; error: string };

// ---- Auth ----------------------------------------------------------------

export async function hashPassword(email: string, password: string) {
  const data = new TextEncoder().encode(`larkspur:${email.trim().toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signIn(email: string, password: string): Promise<Result & { role?: Role }> {
  const s = getState();
  const user = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !user.passwordHash || user.passwordHash !== (await hashPassword(email, password))) {
    return { ok: false, error: "That email and password don't match an account." };
  }
  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended. Contact the front desk to restore access." };
  }
  const users = s.users.map((u) => (u.id === user.id ? { ...u, lastSeenAt: now() } : u));
  commit({ ...s, users, sessionUserId: user.id, activity: withActivity(s, user, "Signed in", "Email and password") });
  return { ok: true, role: user.role };
}

// In production this is Supabase Auth's Google OAuth. The demo signs in a fixed sample Google account.
export function signInWithGoogle(): Result & { role?: Role } {
  const s = getState();
  const email = "jordan.ellis@gmail.example";
  let user = s.users.find((u) => u.email === email);
  let users = s.users;
  let activity = s.activity;
  if (!user) {
    user = {
      id: uid("u"),
      name: "Jordan Ellis",
      email,
      passwordHash: "",
      provider: "google",
      role: "member",
      status: "active",
      company: "",
      phone: "",
      planId: null,
      createdAt: now(),
      lastSeenAt: now(),
    };
    users = [...users, user];
    activity = withActivity(s, user, "Signed up", `${email} via Google`);
  } else if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended. Contact the front desk to restore access." };
  }
  commit({ ...s, users, activity, sessionUserId: user.id });
  return { ok: true, role: user.role };
}

export async function signUp(input: { name: string; email: string; password: string; company: string }): Promise<Result> {
  const s = getState();
  const email = input.email.trim().toLowerCase();
  if (s.users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }
  const user: User = {
    id: uid("u"),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(email, input.password),
    provider: "email",
    role: "member",
    status: "active",
    company: input.company.trim(),
    phone: "",
    planId: null,
    createdAt: now(),
    lastSeenAt: now(),
  };
  const withUser = { ...s, users: [...s.users, user] };
  commit({
    ...withUser,
    sessionUserId: user.id,
    activity: withActivity(s, user, "Signed up", `${email} via email`),
    notifications: withNotification(
      withUser,
      user.id,
      `Welcome to ${s.content.siteName}`,
      "Pick a membership or book a room by the hour to get started.",
      "/app/billing",
    ),
  });
  return { ok: true };
}

export function signOut() {
  const s = getState();
  commit({ ...s, sessionUserId: null });
}

export function resetDemo() {
  const fresh = createSeed();
  commit(fresh);
}

// ---- Profile ---------------------------------------------------------------

export function updateProfile(patch: Pick<User, "name" | "company" | "phone">): Result {
  const s = getState();
  const me = currentUser(s);
  if (!me) return { ok: false, error: "Sign in again to update your profile." };
  if (!patch.name.trim()) return { ok: false, error: "Name can't be empty." };
  const users = s.users.map((u) => (u.id === me.id ? { ...u, ...patch, name: patch.name.trim() } : u));
  commit({ ...s, users, activity: withActivity(s, me, "Updated profile", me.email) });
  return { ok: true };
}

export async function changePassword(current: string, next: string): Promise<Result> {
  const s = getState();
  const me = currentUser(s);
  if (!me) return { ok: false, error: "Sign in again to change your password." };
  if (me.provider === "google" && !me.passwordHash) {
    return { ok: false, error: "This account signs in with Google, so there is no password to change." };
  }
  if (me.passwordHash !== (await hashPassword(me.email, current))) {
    return { ok: false, error: "Your current password is incorrect." };
  }
  const hash = await hashPassword(me.email, next);
  const users = s.users.map((u) => (u.id === me.id ? { ...u, passwordHash: hash } : u));
  commit({ ...s, users, activity: withActivity(s, me, "Changed password", me.email) });
  return { ok: true };
}

// ---- Bookings --------------------------------------------------------------

export function createBooking(spaceId: string, start: Date, hours: number): Result {
  const s = getState();
  const me = currentUser(s);
  const space = s.spaces.find((sp) => sp.id === spaceId && sp.active);
  if (!me) return { ok: false, error: "Sign in again to book." };
  if (!space) return { ok: false, error: "That space isn't available for booking." };
  const startMs = start.getTime();
  const endMs = startMs + hours * 3_600_000;
  if (Number.isNaN(startMs) || startMs < Date.now()) return { ok: false, error: "Pick a start time in the future." };
  const clash = s.bookings.some(
    (b) => b.spaceId === spaceId && b.status === "confirmed" && Date.parse(b.start) < endMs && Date.parse(b.end) > startMs,
  );
  if (clash) return { ok: false, error: `${space.name} is already booked during that time. Try another slot.` };

  const total = space.hourlyRate * hours;
  const payment: Payment = {
    id: uid("pay"),
    invoiceNumber: nextInvoiceNumber(s),
    userId: me.id,
    kind: "booking",
    description: `${space.name}, ${hours} h`,
    amount: total,
    status: "paid",
    createdAt: now(),
    refundedAt: null,
  };
  const booking: Booking = {
    id: uid("bk"),
    userId: me.id,
    spaceId,
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
    status: "confirmed",
    total,
    paymentId: payment.id,
    createdAt: now(),
  };
  commit({
    ...s,
    bookings: [...s.bookings, booking],
    payments: [...s.payments, payment],
    activity: withActivity(s, me, "Booked a space", `${space.name} · ${payment.invoiceNumber}`),
    notifications: withNotification(s, me.id, "Booking confirmed", `${space.name} is reserved for you.`, "/app/bookings"),
  });
  return { ok: true };
}

export function cancelBooking(bookingId: string): Result & { refunded?: boolean } {
  const s = getState();
  const me = currentUser(s);
  const booking = s.bookings.find((b) => b.id === bookingId);
  if (!me || !booking || (booking.userId !== me.id && me.role !== "admin")) {
    return { ok: false, error: "You can't cancel this booking." };
  }
  if (booking.status === "cancelled") return { ok: false, error: "This booking is already cancelled." };
  const refundable = Date.parse(booking.start) - Date.now() >= 24 * 3_600_000;
  const space = s.spaces.find((sp) => sp.id === booking.spaceId);
  const payments = refundable
    ? s.payments.map((p) => (p.id === booking.paymentId ? { ...p, status: "refunded" as const, refundedAt: now() } : p))
    : s.payments;
  commit({
    ...s,
    bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)),
    payments,
    activity: withActivity(
      s,
      me,
      "Cancelled a booking",
      `${space?.name ?? "Space"}${refundable ? " · refunded automatically" : " · inside 24 h, no refund"}`,
    ),
    notifications: withNotification(
      s,
      booking.userId,
      "Booking cancelled",
      refundable
        ? `${space?.name ?? "Your booking"} was cancelled and the charge refunded.`
        : `${space?.name ?? "Your booking"} was cancelled. It was inside 24 hours, so the front desk will review the charge.`,
      "/app/bookings",
    ),
  });
  return { ok: true, refunded: refundable };
}

// ---- Billing ---------------------------------------------------------------

export function changePlan(planId: string | null): Result {
  const s = getState();
  const me = currentUser(s);
  if (!me) return { ok: false, error: "Sign in again to change your plan." };
  const plan = planId ? s.plans.find((p) => p.id === planId && p.active) : null;
  if (planId && !plan) return { ok: false, error: "That plan is no longer offered." };

  const users = s.users.map((u) => (u.id === me.id ? { ...u, planId } : u));
  if (!plan) {
    commit({
      ...s,
      users,
      activity: withActivity(s, me, "Cancelled membership", me.email),
      notifications: withNotification(s, me.id, "Membership cancelled", "You can still book rooms at hourly rates.", "/app/billing"),
    });
    return { ok: true };
  }
  const payment: Payment = {
    id: uid("pay"),
    invoiceNumber: nextInvoiceNumber(s),
    userId: me.id,
    kind: "subscription",
    description: `${plan.name} membership`,
    amount: plan.monthlyPrice,
    status: "paid",
    createdAt: now(),
    refundedAt: null,
  };
  commit({
    ...s,
    users,
    payments: [...s.payments, payment],
    activity: withActivity(s, me, "Changed plan", `${plan.name} · ${payment.invoiceNumber}`),
    notifications: withNotification(s, me.id, "Payment received", `You're on ${plan.name}. Invoice ${payment.invoiceNumber} is in Billing.`, "/app/billing"),
  });
  return { ok: true };
}

// ---- Support ---------------------------------------------------------------

export function createTicket(input: { subject: string; body: string; name?: string; email?: string }): Result & { id?: string } {
  const s = getState();
  const me = currentUser(s);
  const name = me?.name ?? input.name?.trim() ?? "";
  const email = me?.email ?? input.email?.trim().toLowerCase() ?? "";
  if (!input.subject.trim() || !input.body.trim()) return { ok: false, error: "Add a subject and a message." };
  if (!me && (!name || !/^\S+@\S+\.\S+$/.test(email))) return { ok: false, error: "Add your name and a valid email so we can reply." };
  const ts = now();
  const ticket: Ticket = {
    id: uid("tk"),
    userId: me?.id ?? null,
    name,
    email,
    subject: input.subject.trim(),
    source: me ? "dashboard" : "contact form",
    status: "open",
    createdAt: ts,
    updatedAt: ts,
    messages: [{ id: uid("m"), authorId: me?.id ?? null, authorName: name, fromStaff: false, body: input.body.trim(), createdAt: ts }],
  };
  commit({
    ...s,
    tickets: [ticket, ...s.tickets],
    activity: withActivity(s, me, "Opened a ticket", ticket.subject, name),
  });
  return { ok: true, id: ticket.id };
}

export function replyToTicket(ticketId: string, body: string): Result {
  const s = getState();
  const me = currentUser(s);
  const ticket = s.tickets.find((t) => t.id === ticketId);
  if (!me || !ticket) return { ok: false, error: "This ticket couldn't be found." };
  const staff = me.role === "admin";
  if (!staff && ticket.userId !== me.id) return { ok: false, error: "You can't reply to this ticket." };
  if (!body.trim()) return { ok: false, error: "Write a message first." };
  const ts = now();
  const message = { id: uid("m"), authorId: me.id, authorName: me.name, fromStaff: staff, body: body.trim(), createdAt: ts };
  const status: TicketStatus = staff ? "pending" : "open";
  const tickets = s.tickets.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: ts, messages: [...t.messages, message] } : t));
  commit({
    ...s,
    tickets,
    activity: withActivity(s, me, staff ? "Replied to ticket" : "Added to ticket", ticket.subject),
    notifications:
      staff && ticket.userId
        ? withNotification(s, ticket.userId, "Reply on your ticket", `${me.name} replied to “${ticket.subject}”.`, "/app/support")
        : s.notifications,
  });
  return { ok: true };
}

export function setTicketStatus(ticketId: string, status: TicketStatus) {
  const s = getState();
  const me = currentUser(s);
  const ticket = s.tickets.find((t) => t.id === ticketId);
  if (!me || !ticket) return;
  commit({
    ...s,
    tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: now() } : t)),
    activity: withActivity(s, me, `Marked ticket ${status}`, ticket.subject),
  });
}

// ---- Notifications ---------------------------------------------------------

export function markNotificationsRead(ids?: string[]) {
  const s = getState();
  const me = currentUser(s);
  if (!me) return;
  const notifications = s.notifications.map((n) =>
    n.userId === me.id && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n,
  );
  commit({ ...s, notifications });
}

// ---- Admin -----------------------------------------------------------------

function requireAdmin(s: State) {
  const me = currentUser(s);
  return me?.role === "admin" ? me : null;
}

export function adminUpdateUser(userId: string, patch: Partial<Pick<User, "name" | "role" | "status" | "company">>): Result {
  const s = getState();
  const admin = requireAdmin(s);
  if (!admin) return { ok: false, error: "Only admins can edit users." };
  if (userId === admin.id && (patch.role === "member" || patch.status === "suspended")) {
    return { ok: false, error: "You can't remove your own admin access or suspend yourself." };
  }
  const target = s.users.find((u) => u.id === userId);
  if (!target) return { ok: false, error: "User not found." };
  const changes = Object.entries(patch)
    .filter(([k, v]) => target[k as keyof User] !== v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  commit({
    ...s,
    users: s.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    activity: withActivity(s, admin, "Edited user", `${target.email}${changes ? ` · ${changes}` : ""}`),
  });
  return { ok: true };
}

export function adminRefund(paymentId: string): Result {
  const s = getState();
  const admin = requireAdmin(s);
  const payment = s.payments.find((p) => p.id === paymentId);
  if (!admin) return { ok: false, error: "Only admins can issue refunds." };
  if (!payment || payment.status === "refunded") return { ok: false, error: "This payment can't be refunded." };
  commit({
    ...s,
    payments: s.payments.map((p) => (p.id === paymentId ? { ...p, status: "refunded", refundedAt: now() } : p)),
    activity: withActivity(s, admin, "Issued refund", `${payment.invoiceNumber} · ${payment.description}`),
    notifications: withNotification(s, payment.userId, "Refund issued", `Invoice ${payment.invoiceNumber} was refunded to your card.`, "/app/billing"),
  });
  return { ok: true };
}

export function adminSaveSpace(space: Space): Result {
  const s = getState();
  const admin = requireAdmin(s);
  if (!admin) return { ok: false, error: "Only admins can edit spaces." };
  if (!space.name.trim()) return { ok: false, error: "Give the space a name." };
  if (space.hourlyRate <= 0 || space.capacity <= 0) return { ok: false, error: "Rate and capacity must be above zero." };
  const exists = s.spaces.some((sp) => sp.id === space.id);
  commit({
    ...s,
    spaces: exists ? s.spaces.map((sp) => (sp.id === space.id ? space : sp)) : [...s.spaces, space],
    activity: withActivity(s, admin, exists ? "Edited space" : "Added space", space.name),
  });
  return { ok: true };
}

export function adminSavePlan(plan: Plan): Result {
  const s = getState();
  const admin = requireAdmin(s);
  if (!admin) return { ok: false, error: "Only admins can edit plans." };
  if (!plan.name.trim()) return { ok: false, error: "Give the plan a name." };
  if (plan.monthlyPrice <= 0) return { ok: false, error: "Monthly price must be above zero." };
  const exists = s.plans.some((p) => p.id === plan.id);
  commit({
    ...s,
    plans: exists ? s.plans.map((p) => (p.id === plan.id ? plan : p)) : [...s.plans, plan],
    activity: withActivity(s, admin, exists ? "Edited plan" : "Added plan", plan.name),
  });
  return { ok: true };
}

export function adminSaveContent(content: SiteContent): Result {
  const s = getState();
  const admin = requireAdmin(s);
  if (!admin) return { ok: false, error: "Only admins can edit site content." };
  if (!content.siteName.trim() || !content.heroTitle.trim()) return { ok: false, error: "Site name and headline are required." };
  commit({ ...s, content, activity: withActivity(s, admin, "Published site content", "Website pages updated") });
  return { ok: true };
}

export { uid };
