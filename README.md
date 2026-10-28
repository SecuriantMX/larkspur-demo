# Larkspur Portal

A working prototype of a three-part web platform: a public website, a member dashboard and an admin panel, all sharing one data model. It's built around a sample coworking business (rooms booked by the hour, monthly memberships), but the structure maps onto any service business that sells bookings and subscriptions.

## What's in it

**Public website**
Home, Spaces, Pricing, About, FAQ and Contact. All copy, prices and FAQ entries come from the admin panel. The contact form drops messages straight into the support inbox.

**Member dashboard** (`/app`)
- Sign up / sign in with email or Google
- Bookings with conflict checks, cancellation, and an automatic refund when cancelled 24+ hours ahead
- Membership plans with a checkout step, invoices and payment history
- Support requests with threaded replies
- In-app notifications (each one also flagged as emailed)
- Profile and password management

**Admin panel** (`/admin`)
- Analytics: sign-ups, revenue, MRR, membership mix, recent activity
- Users: search, filters, edit role, suspend/reactivate, CSV export
- Spaces and plans: create, edit, hide or retire
- Payments: filters, refunds, CSV export
- Support inbox: reply, close, reopen; website messages included
- Website content editor with draft and publish
- Activity log with search and CSV export

Role checks keep members out of `/admin`. Suspended users can't sign in, and an admin can't demote or suspend themselves.

## Demo accounts

| Role   | Email                | Password  |
|--------|----------------------|-----------|
| Member | member@larkspur.demo | demo1234  |
| Admin  | admin@larkspur.demo  | admin1234 |

"Continue with Google" signs in as a sample Google user in this build.

## How the demo stores data

To run with zero setup, the whole state lives in the browser's `localStorage`, seeded with realistic sample data on first load. "Reset demo" in the top bar restores the seed. All reads and writes go through `lib/store.ts`, so moving to a real backend means replacing that one module, not rewriting the pages.

Production plan for that module:

- **Supabase** (Postgres + Auth + Storage) with row-level security so members only ever read their own rows
- **Supabase Auth** for email and Google OAuth
- **Stripe Checkout + webhooks** for memberships and booking charges; plan changes applied only when Stripe confirms payment
- **Resend or Postmark** for transactional email
- Server-side admin actions (refunds, role changes) behind API routes, never trusted from the client

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository and keep the defaults (Next.js is detected automatically).
3. Click **Deploy**. No environment variables are needed for the demo.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, lucide-react icons.
