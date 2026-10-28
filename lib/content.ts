import type { Plan, SiteContent, Space } from "./types";

export const defaultContent: SiteContent = {
  siteName: "Larkspur",
  heroEyebrow: "Shockoe Bottom · Richmond, VA",
  heroTitle: "Rooms and desks you book in a minute, not an email thread.",
  heroSubtitle:
    "Larkspur is a workspace for small teams and independents. Pick a membership, reserve meeting rooms and studios by the hour, and keep invoices, bookings and support in one account.",
  aboutTitle: "Built for people who bill by the hour",
  aboutBody:
    "We opened Larkspur in a converted tobacco warehouse in 2019 with twelve desks and one meeting room. Today we run five bookable spaces across two floors. Members tell us the same thing every year: they want to see availability, book it, and get on with their day. This portal is how we do that.\n\nEvery member gets a dashboard with their bookings, invoices and support history. Our front desk team answers tickets during staffed hours and usually within one business day.",
  contactEmail: "hello@larkspur.demo",
  contactPhone: "(804) 555-0142",
  address: "1720 E Main St, Richmond, VA 23223",
  hours: "Mon–Fri 7:00–20:00 · Sat 9:00–14:00",
  faq: [
    {
      id: "faq-1",
      question: "Can I book a room without a membership?",
      answer:
        "Yes. Create a free account and pay per hour at the listed rate. Members on any plan get the same rooms with billing on their monthly invoice.",
    },
    {
      id: "faq-2",
      question: "How do cancellations work?",
      answer:
        "Cancel from your dashboard up to 24 hours before the start time and the charge is refunded automatically. Later cancellations are reviewed by the front desk.",
    },
    {
      id: "faq-3",
      question: "Can I change or pause my plan?",
      answer:
        "Switch plans at any time from Billing. The new price applies from the day you change. To pause, cancel the plan and pick it up again later; your account and history stay in place.",
    },
    {
      id: "faq-4",
      question: "Do you have parking?",
      answer:
        "There is metered street parking on Main and 18th, and a paid deck on Dock Street two minutes away. Bike racks are inside the lobby.",
    },
    {
      id: "faq-5",
      question: "How fast does support reply?",
      answer:
        "Tickets opened from the dashboard are answered within one business day during staffed hours. For anything urgent in the building, call the front desk.",
    },
  ],
};

export const defaultSpaces: Space[] = [
  {
    id: "sp-fieldstone",
    unit: "1A",
    name: "Fieldstone Room",
    kind: "Meeting room",
    description: "Exposed brick, 75\" display, whiteboard wall. Good for client meetings and workshops.",
    capacity: 6,
    hourlyRate: 3500,
    active: true,
  },
  {
    id: "sp-canal",
    unit: "1C",
    name: "Canal Room",
    kind: "Meeting room",
    description: "Our largest room, with views over the canal walk. Video conferencing kit included.",
    capacity: 12,
    hourlyRate: 5500,
    active: true,
  },
  {
    id: "sp-studio",
    unit: "2A",
    name: "Podcast Studio",
    kind: "Studio",
    description: "Treated room with three Shure SM7B mics, a RodeCaster Pro II and a recording laptop.",
    capacity: 3,
    hourlyRate: 4000,
    active: true,
  },
  {
    id: "sp-office-2b",
    unit: "2B",
    name: "Office 2B",
    kind: "Private office",
    description: "Lockable office for up to four people. Book it by the hour for focused team days.",
    capacity: 4,
    hourlyRate: 2800,
    active: true,
  },
  {
    id: "sp-desk",
    unit: "2D",
    name: "Quiet Floor Desk",
    kind: "Desk",
    description: "Hot desk on the silent second floor. Monitor, dock and locker included.",
    capacity: 1,
    hourlyRate: 600,
    active: true,
  },
];

export const defaultPlans: Plan[] = [
  {
    id: "pl-flex",
    name: "Flex",
    monthlyPrice: 14900,
    description: "For independents who come in a few days a month.",
    features: ["8 desk days a month", "Member rates on rooms", "Mail handling", "Guest Wi-Fi passes"],
    active: true,
  },
  {
    id: "pl-resident",
    name: "Resident",
    monthlyPrice: 34900,
    description: "A dedicated desk and 24/7 access.",
    features: ["Dedicated desk with locker", "24/7 building access", "6 meeting room hours", "Business address"],
    active: true,
  },
  {
    id: "pl-team",
    name: "Team Suite",
    monthlyPrice: 119000,
    description: "A private office for teams of up to four.",
    features: ["Private lockable office", "Up to 4 member seats", "20 meeting room hours", "Priority support"],
    active: true,
  },
];
