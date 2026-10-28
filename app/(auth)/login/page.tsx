"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleButton } from "@/components/google-button";
import { Button, Field, FormError, Input } from "@/components/ui";
import { signIn } from "@/lib/store";

const demoAccounts = [
  { label: "Member", email: "member@larkspur.demo", password: "demo1234" },
  { label: "Admin", email: "admin@larkspur.demo", password: "admin1234" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    const next = new URLSearchParams(window.location.search).get("next");
    const home = result.role === "admin" ? "/admin" : "/app";
    router.push(next && next.startsWith(home) ? next : home);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">
          New here?{" "}
          <Link href="/signup" className="font-medium text-accent">
            Create an account
          </Link>
        </p>
      </div>

      <GoogleButton label="Continue with Google" />

      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="login-email">
          <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <FormError message={error} />
        <Button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="rounded-md border border-dashed border-line p-3 text-sm">
        <p className="font-medium">Try a demo account</p>
        <div className="mt-2 flex gap-2">
          {demoAccounts.map((a) => (
            <Button
              key={a.label}
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                setEmail(a.email);
                setPassword(a.password);
                setError(null);
              }}
            >
              Fill {a.label.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
