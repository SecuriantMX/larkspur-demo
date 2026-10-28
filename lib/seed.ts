import { defaultContent, defaultPlans, defaultSpaces } from "./content";
import type { ActivityEntry, Booking, Notification, Payment, State, Ticket, User } from "./types";

export const STATE_VERSION = 1;

const DAY = 86_400_000;
const HOUR = 3_600_000;

// Hashes of the published demo passwords (see README). Real accounts are hashed at sign-up.
const MEMBER_HASH = "fdb165ca89061e5ae64173596ebd690dc289e642d08c7d1157acccf47881f3a6";
const ADMIN_HASH = "48765cc89e4a1051f838273b10c18196e44d6ec2bdb5304463a66e1c776f96b0";

const FIRST = [
  "Avery", "Jamal", "Priya", "Owen", "Lucia", "Theo", "Hana", "Ezra", "Nadia", "Caleb",
  "Imani", "Rafael", "Greta", "Malik", "Sofia", "Wes", "Ines", "Darius", "Mei", "Callum",
  "Tessa", "Andre", "Yara", "Felix", "June", "Kofi", "Rosa", "Silas", "Amara", "Bennett",
];
const LAST = [
  "Okafor", "Lindqvist", "Ramos", "Patel", "Brennan", "Castillo", "Nguyen", "Whitaker", "Haddad", "Moreau",
  "Sato", "Abernathy", "Delgado", "Fischer", "Osei", "Calloway", "Ibarra", "Kowalski", "Reyes", "Thornton",
];
const COMPANIES = [
  "Riverline Studio", "Cobalt & Pine", "Northpaw Labs", "Hearth Legal", "Fallline Media", "Sable Analytics",
  "Morrow Architects", "Brightwork Co.", "Tidewater Bookkeeping", "Self-employed", "Self-employed", "Self-employed",
];

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (ms: number) => new Date(ms).toISOString();

export function createSeed(now = Date.now()): State {
  const rand = rng(20261028);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();

  const users: User[] = [
    {
      id: "u-admin",
      name: "Dana Whitfield",
      email: "admin@larkspur.demo",
      passwordHash: ADMIN_HASH,
      provider: "email",
      role: "admin",
      status: "active",
      company: "Larkspur",
      phone: "(804) 555-0142",
      planId: null,
      createdAt: iso(now - 210 * DAY),
      lastSeenAt: iso(now - 2 * HOUR),
    },
    {
      id: "u-member",
      name: "Marcus Reyes",
      email: "member@larkspur.demo",
      passwordHash: MEMBER_HASH,
      provider: "email",
      role: "member",
      status: "active",
      company: "Riverline Studio",
      phone: "(804) 555-0187",
      planId: "pl-resident",
      createdAt: iso(now - 74 * DAY),
      lastSeenAt: iso(now - 26 * HOUR),
    },
  ];

  const usedEmails = new Set(users.map((u) => u.email));
  for (let i = 0; users.length < 48; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const email = `${first}.${last}`.toLowerCase() + "@example.com";
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);
    const created = now - Math.floor(rand() * 120 * DAY) - Math.floor(rand() * DAY);
    const roll = rand();
    const planId = roll < 0.25 ? "pl-flex" : roll < 0.45 ? "pl-resident" : roll < 0.55 ? "pl-team" : null;
    users.push({
      id: `u-${i + 1}`,
      name: `${first} ${last}`,
      email,
      passwordHash: "",
      provider: rand() < 0.3 ? "google" : "email",
      role: "member",
      status: i === 7 || i === 23 ? "suspended" : "active",
      company: pick(COMPANIES),
      phone: "",
      planId,
      createdAt: iso(created),
      lastSeenAt: iso(Math.min(now, created + rand() * (now - created))),
    });
  }

  const payments: Payment[] = [];
  const addPayment = (p: Omit<Payment, "invoiceNumber" | "id">) => {
    const payment = { ...p, id: `pay-${payments.length + 1}`, invoiceNumber: "" };
    payments.push(payment);
    return payment;
  };

  const planById = new Map(defaultPlans.map((p) => [p.id, p]));
  for (const user of users) {
    if (!user.planId) continue;
    const plan = planById.get(user.planId)!;
    for (let t = Date.parse(user.createdAt); t <= now; t += 30 * DAY) {
      addPayment({
        userId: user.id,
        kind: "subscription",
        description: `${plan.name} membership`,
        amount: plan.monthlyPrice,
        status: "paid",
        createdAt: iso(t),
        refundedAt: null,
      });
    }
  }

  const bookings: Booking[] = [];
  const spaceById = new Map(defaultSpaces.map((s) => [s.id, s]));
  const overlaps = (spaceId: string, start: number, end: number) =>
    bookings.some(
      (b) => b.spaceId === spaceId && b.status === "confirmed" && Date.parse(b.start) < end && Date.parse(b.end) > start,
    );

  const addBooking = (userId: string, spaceId: string, start: number, hours: number, cancelled = false) => {
    const end = start + hours * HOUR;
    if (overlaps(spaceId, start, end)) return;
    const space = spaceById.get(spaceId)!;
    const user = users.find((u) => u.id === userId)!;
    // Booked a few days ahead; for upcoming slots that means sometime in the past week, never "now".
    const lead = (1 + Math.floor(rand() * 6)) * DAY;
    const recent = now - HOUR - Math.floor(rand() * 12 * DAY);
    const createdAt = Math.max(Date.parse(user.createdAt), Math.min(start - lead, recent));
    const total = space.hourlyRate * hours;
    const payment = addPayment({
      userId,
      kind: "booking",
      description: `${space.name}, ${hours} h`,
      amount: total,
      status: cancelled ? "refunded" : "paid",
      createdAt: iso(createdAt),
      refundedAt: cancelled ? iso(Math.min(createdAt + DAY, now - HOUR)) : null,
    });
    bookings.push({
      id: `bk-${bookings.length + 1}`,
      userId,
      spaceId,
      start: iso(start),
      end: iso(end),
      status: cancelled ? "cancelled" : "confirmed",
      total,
      paymentId: payment.id,
      createdAt: iso(createdAt),
    });
  };

  const slot = (dayOffset: number, hour: number) => today + dayOffset * DAY + hour * HOUR;

  addBooking("u-member", "sp-fieldstone", slot(2, 10), 2);
  addBooking("u-member", "sp-studio", slot(6, 14), 1);
  addBooking("u-member", "sp-canal", slot(-9, 13), 3);
  addBooking("u-member", "sp-fieldstone", slot(-23, 9), 1);
  addBooking("u-member", "sp-studio", slot(-41, 15), 2, true);

  // A believable "today" for the availability board on the home page.
  addBooking(users[3].id, "sp-canal", slot(0, 9), 2);
  addBooking(users[4].id, "sp-fieldstone", slot(0, 13), 2);
  addBooking(users[6].id, "sp-studio", slot(0, 10), 3);
  addBooking(users[8].id, "sp-office-2b", slot(0, 8), 8);
  addBooking(users[9].id, "sp-canal", slot(0, 15), 3);
  addBooking(users[12].id, "sp-desk", slot(0, 11), 6);

  for (const user of users.slice(2)) {
    const count = Math.floor(rand() * 4);
    const from = Math.ceil((Date.parse(user.createdAt) - today) / DAY);
    for (let i = 0; i < count; i++) {
      const offset = from + Math.floor(rand() * (7 - from));
      const space = pick(defaultSpaces);
      addBooking(user.id, space.id, slot(offset, 8 + Math.floor(rand() * 9)), 1 + Math.floor(rand() * 3), rand() < 0.08);
    }
  }

  payments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  payments.forEach((p, i) => {
    p.invoiceNumber = `LS-${String(1001 + i)}`;
  });

  const ticket = (
    id: string,
    user: User | null,
    guest: { name: string; email: string } | null,
    subject: string,
    status: Ticket["status"],
    daysAgo: number,
    thread: Array<[boolean, string]>,
  ): Ticket => {
    const created = now - daysAgo * DAY;
    const messages = thread.map(([staff, body], i) => ({
      id: `${id}-m${i + 1}`,
      authorId: staff ? "u-admin" : user?.id ?? null,
      authorName: staff ? "Dana Whitfield" : user?.name ?? guest!.name,
      fromStaff: staff,
      body,
      createdAt: iso(created + i * 5 * HOUR),
    }));
    return {
      id,
      userId: user?.id ?? null,
      name: user?.name ?? guest!.name,
      email: user?.email ?? guest!.email,
      subject,
      source: user ? "dashboard" : "contact form",
      status,
      createdAt: iso(created),
      updatedAt: messages[messages.length - 1].createdAt,
      messages,
    };
  };

  const member = users[1];
  const tickets: Ticket[] = [
    ticket("tk-1", member, null, "Projector cable missing in Canal Room", "pending", 9, [
      [false, "The HDMI-to-USB-C adapter wasn't in the Canal Room this morning. We managed with a laptop screen but it would be good to have it back before Friday."],
      [true, "Thanks Marcus. We found it in Office 2B and put it back, plus a spare in the drawer under the display. Can you confirm it's there next time you're in?"],
    ]),
    ticket("tk-2", member, null, "Add our company name to invoices", "closed", 31, [
      [false, "Could you add Riverline Studio LLC and our billing address to invoices going forward?"],
      [true, "Done. Company name and address now print on every invoice from LS-1040 onward."],
      [false, "Perfect, thank you."],
    ]),
    ticket("tk-3", users[5], null, "Can I bring a dog on Fridays?", "open", 1, [
      [false, "I have a very calm 9-year-old greyhound. Is the building dog friendly at all?"],
    ]),
    ticket("tk-4", users[11], null, "Double charged for Podcast Studio", "open", 0.3, [
      [false, "I see two charges for the same studio session last Tuesday. Can one be refunded?"],
    ]),
    ticket("tk-5", null, { name: "Helen Marsh", email: "helen.marsh@example.com" }, "Team of 6 looking for space from January", "open", 2, [
      [false, "We're a six-person design team and need a private office from January. Is Team Suite available for six, or do you have something larger?"],
    ]),
    ticket("tk-6", users[17], null, "Wi-Fi drops on the second floor", "closed", 18, [
      [false, "Connection keeps dropping near the window desks upstairs."],
      [true, "We replaced the access point on Tuesday. Let us know if it happens again."],
    ]),
  ];

  const notifications: Notification[] = [
    {
      id: "nt-1",
      userId: "u-member",
      title: "Reply on your ticket",
      body: "Dana replied to “Projector cable missing in Canal Room”.",
      href: "/app/support",
      read: false,
      emailed: true,
      createdAt: iso(now - 9 * DAY + 5 * HOUR),
    },
    {
      id: "nt-2",
      userId: "u-member",
      title: "Booking confirmed",
      body: "Fieldstone Room is reserved for you. Details are in Bookings.",
      href: "/app/bookings",
      read: false,
      emailed: true,
      createdAt: iso(now - 1 * DAY),
    },
    {
      id: "nt-3",
      userId: "u-member",
      title: "Payment received",
      body: "Your Resident membership renewed. The invoice is in Billing.",
      href: "/app/billing",
      read: true,
      emailed: true,
      createdAt: iso(now - 14 * DAY),
    },
  ];

  const activity: ActivityEntry[] = [];
  const log = (actor: User | null, action: string, detail: string, at: string) =>
    activity.push({ id: `ac-${activity.length + 1}`, actorId: actor?.id ?? null, actorName: actor?.name ?? "System", action, detail, createdAt: at });

  const userById = new Map(users.map((u) => [u.id, u]));
  for (const u of users) log(u, "Signed up", `${u.email} via ${u.provider === "google" ? "Google" : "email"}`, u.createdAt);
  for (const p of payments) {
    if (Date.parse(p.createdAt) > now) continue;
    log(userById.get(p.userId)!, "Payment received", `${p.invoiceNumber} · ${p.description}`, p.createdAt);
    if (p.refundedAt) log(null, "Payment refunded", `${p.invoiceNumber} refunded after cancellation`, p.refundedAt);
  }
  for (const b of bookings) {
    if (Date.parse(b.createdAt) > now) continue;
    log(userById.get(b.userId)!, "Booked a space", `${spaceById.get(b.spaceId)!.name}`, b.createdAt);
  }
  for (const t of tickets) log(t.userId ? userById.get(t.userId)! : null, "Opened a ticket", t.subject, t.createdAt);
  activity.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    version: STATE_VERSION,
    seededAt: iso(now),
    sessionUserId: null,
    users,
    spaces: defaultSpaces.map((s) => ({ ...s })),
    plans: defaultPlans.map((p) => ({ ...p, features: [...p.features] })),
    bookings,
    payments,
    tickets,
    notifications,
    activity: activity.slice(0, 400),
    content: { ...defaultContent, faq: defaultContent.faq.map((f) => ({ ...f })) },
  };
}
