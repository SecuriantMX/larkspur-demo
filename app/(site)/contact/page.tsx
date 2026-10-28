"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, FormError, Input, Textarea } from "@/components/ui";
import { createTicket } from "@/lib/store";
import { usePublicData } from "@/lib/use-content";

export default function ContactPage() {
  const { content, user } = usePublicData();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = createTicket({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      body: String(form.get("message") ?? ""),
    });
    if (!result.ok) return setError(result.error);
    setError(null);
    setSent(true);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-[max(16px,env(safe-area-inset-left))] pt-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="sign text-6xl sm:text-7xl">Talk to the front desk</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Questions about memberships, team space or a booking. Messages go straight to the support inbox and we reply by email within one business day.
        </p>
        <dl className="mt-8 flex flex-col gap-4 text-sm">
          <div>
            <dt className="eyebrow text-ink-soft">Email</dt>
            <dd className="font-medium select-all">{content.contactEmail}</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-soft">Phone</dt>
            <dd className="font-medium select-all">{content.contactPhone}</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-soft">Visit</dt>
            <dd className="font-medium">{content.address}</dd>
            <dd className="text-ink-soft">{content.hours}</dd>
          </div>
        </dl>
      </div>

      <div className="border-2 border-ink border-t-[6px] border-t-tape bg-surface p-6">
        {sent ? (
          <div className="flex flex-col gap-2 py-8 text-center">
            <p className="sign text-4xl">Message received</p>
            <p className="text-sm text-ink-soft">It&apos;s in our support inbox. We&apos;ll reply to the email you gave us.</p>
            <Button variant="secondary" className="mx-auto mt-4" onClick={() => setSent(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            {!user && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="contact-name">
                  <Input id="contact-name" name="name" autoComplete="name" required />
                </Field>
                <Field label="Email" htmlFor="contact-email">
                  <Input id="contact-email" name="email" type="email" autoComplete="email" required />
                </Field>
              </div>
            )}
            <Field label="Subject" htmlFor="contact-subject">
              <Input id="contact-subject" name="subject" placeholder="Team space from January" required />
            </Field>
            <Field label="Message" htmlFor="contact-message">
              <Textarea id="contact-message" name="message" rows={6} required />
            </Field>
            <FormError message={error} />
            <Button type="submit" className="self-start">
              Send message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
