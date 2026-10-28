export type Role = "member" | "admin";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  provider: "email" | "google";
  role: Role;
  status: UserStatus;
  company: string;
  phone: string;
  planId: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export type SpaceKind = "Meeting room" | "Private office" | "Studio" | "Desk";

export interface Space {
  id: string;
  unit: string; // door number on the building plan, e.g. "1A"
  name: string;
  kind: SpaceKind;
  description: string;
  capacity: number;
  hourlyRate: number; // cents
  active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number; // cents
  description: string;
  features: string[];
  active: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  spaceId: string;
  start: string;
  end: string;
  status: "confirmed" | "cancelled";
  total: number;
  paymentId: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceNumber: string;
  userId: string;
  kind: "subscription" | "booking";
  description: string;
  amount: number;
  status: "paid" | "refunded";
  createdAt: string;
  refundedAt: string | null;
}

export interface TicketMessage {
  id: string;
  authorId: string | null;
  authorName: string;
  fromStaff: boolean;
  body: string;
  createdAt: string;
}

export type TicketStatus = "open" | "pending" | "closed";

export interface Ticket {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  source: "dashboard" | "contact form";
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  emailed: boolean;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteContent {
  siteName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  hours: string;
  faq: FaqItem[];
}

export interface State {
  version: number;
  seededAt: string;
  sessionUserId: string | null;
  users: User[];
  spaces: Space[];
  plans: Plan[];
  bookings: Booking[];
  payments: Payment[];
  tickets: Ticket[];
  notifications: Notification[];
  activity: ActivityEntry[];
  content: SiteContent;
}
