"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleButton } from "@/components/google-button";
import { Button, Field, FormError, Input } from "@/components/ui";
import { signUp } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!name) return setError("Add your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    setBusy(true);
    const result = await signUp({ name, email, password, company: String(form.get("company") ?? "") });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    router.push("/app");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Already a member?{" "}
          <Link href="/login" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </div>

      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Full name" htmlFor="signup-name">
          <Input id="signup-name" name="name" autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="signup-email">
          <Input id="signup-email" name="email" type="email" autoComplete="email" />
        </Field>
        <Field label="Company" hint="Optional. Printed on your invoices." htmlFor="signup-company">
          <Input id="signup-company" name="company" autoComplete="organization" />
        </Field>
        <Field label="Password" hint="At least 8 characters." htmlFor="signup-password">
          <Input id="signup-password" name="password" type="password" autoComplete="new-password" />
        </Field>
        <FormError message={error} />
        <Button type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
