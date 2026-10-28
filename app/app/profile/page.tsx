"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/components/toast";
import { Button, Field, FormError, Input, PageHeader, Panel, PanelHeader } from "@/components/ui";
import { date } from "@/lib/format";
import { changePassword, updateProfile, useAuthed } from "@/lib/store";

export default function ProfilePage() {
  const session = useAuthed();
  const toast = useToast();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!session) return null;
  const { user } = session;

  function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const result = updateProfile({
      name: String(f.get("name") ?? ""),
      company: String(f.get("company") ?? ""),
      phone: String(f.get("phone") ?? ""),
    });
    if (!result.ok) return setProfileError(result.error);
    setProfileError(null);
    toast("Profile saved.");
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const next = String(f.get("next") ?? "");
    if (next.length < 8) return setPasswordError("Use at least 8 characters for the new password.");
    if (next !== f.get("confirm")) return setPasswordError("The two new passwords don't match.");
    const result = await changePassword(String(f.get("current") ?? ""), next);
    if (!result.ok) return setPasswordError(result.error);
    setPasswordError(null);
    form.reset();
    toast("Password updated.");
  }

  return (
    <>
      <PageHeader title="Profile" description={`Member since ${date(user.createdAt)}.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Account details" />
          <form key={user.id} onSubmit={saveProfile} className="flex flex-col gap-4 p-5">
            <Field label="Full name" htmlFor="profile-name">
              <Input id="profile-name" name="name" defaultValue={user.name} autoComplete="name" />
            </Field>
            <Field label="Email" hint="Contact the front desk to change the email on your account." htmlFor="profile-email">
              <Input id="profile-email" value={user.email} disabled readOnly />
            </Field>
            <Field label="Company" hint="Printed on your invoices." htmlFor="profile-company">
              <Input id="profile-company" name="company" defaultValue={user.company} autoComplete="organization" />
            </Field>
            <Field label="Phone" htmlFor="profile-phone">
              <Input id="profile-phone" name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" />
            </Field>
            <FormError message={profileError} />
            <Button type="submit" className="self-start">
              Save changes
            </Button>
          </form>
        </Panel>

        <Panel>
          <PanelHeader title="Password" />
          {user.provider === "google" && !user.passwordHash ? (
            <p className="p-5 text-sm text-ink-soft">You sign in with Google, so there is no password to manage here.</p>
          ) : (
            <form onSubmit={savePassword} className="flex flex-col gap-4 p-5">
              <Field label="Current password" htmlFor="pw-current">
                <Input id="pw-current" name="current" type="password" autoComplete="current-password" />
              </Field>
              <Field label="New password" hint="At least 8 characters." htmlFor="pw-next">
                <Input id="pw-next" name="next" type="password" autoComplete="new-password" />
              </Field>
              <Field label="Confirm new password" htmlFor="pw-confirm">
                <Input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" />
              </Field>
              <FormError message={passwordError} />
              <Button type="submit" className="self-start">
                Update password
              </Button>
            </form>
          )}
        </Panel>
      </div>
    </>
  );
}
