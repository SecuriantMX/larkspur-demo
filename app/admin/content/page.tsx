"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { Button, Field, FormError, Input, PageHeader, Panel, PanelHeader, Textarea } from "@/components/ui";
import { adminSaveContent, uid, useAuthed } from "@/lib/store";
import type { SiteContent } from "@/lib/types";

export default function AdminContent() {
  const session = useAuthed();
  const toast = useToast();
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const published = session?.state.content;

  useEffect(() => {
    if (published && !draft) setDraft(structuredClone(published));
  }, [published, draft]);

  if (!session || !draft) return null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(published);
  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setDraft({ ...draft, [key]: value });

  function publish() {
    const result = adminSaveContent({
      ...draft!,
      faq: draft!.faq.filter((f) => f.question.trim() && f.answer.trim()),
    });
    if (!result.ok) return setError(result.error);
    setError(null);
    setDraft(null);
    toast("Published. The website shows the new content now.");
  }

  const text = (key: keyof SiteContent, label: string, id: string, hint?: string) => (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input id={id} value={draft[key] as string} onChange={(e) => set(key, e.target.value as never)} />
    </Field>
  );

  return (
    <>
      <PageHeader
        title="Website content"
        description="Edit the public pages without a deploy. Nothing changes on the site until you publish."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(structuredClone(published!))}>
              Discard
            </Button>
            <Button disabled={!dirty} onClick={publish}>
              Publish changes
            </Button>
          </div>
        }
      />
      <FormError message={error} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Home page"
            action={
              <Link href="/" target="_blank" className="text-sm text-accent">
                Open site
              </Link>
            }
          />
          <div className="flex flex-col gap-4 p-5">
            {text("siteName", "Site name", "c-site-name", "Shown in the header, footer and emails.")}
            {text("heroEyebrow", "Eyebrow", "c-eyebrow")}
            <Field label="Headline" htmlFor="c-title">
              <Textarea id="c-title" value={draft.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} rows={2} />
            </Field>
            <Field label="Intro" htmlFor="c-subtitle">
              <Textarea id="c-subtitle" value={draft.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} rows={3} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="About and contact" />
          <div className="flex flex-col gap-4 p-5">
            {text("aboutTitle", "About heading", "c-about-title")}
            <Field label="About text" hint="Leave a blank line between paragraphs." htmlFor="c-about-body">
              <Textarea id="c-about-body" value={draft.aboutBody} onChange={(e) => set("aboutBody", e.target.value)} rows={6} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("contactEmail", "Email", "c-email")}
              {text("contactPhone", "Phone", "c-phone")}
            </div>
            {text("address", "Address", "c-address")}
            {text("hours", "Staffed hours", "c-hours")}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="FAQ"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => set("faq", [...draft.faq, { id: uid("faq"), question: "", answer: "" }])}
            >
              <Plus size={14} /> Add question
            </Button>
          }
        />
        <ol className="divide-y divide-line">
          {draft.faq.map((item, i) => (
            <li key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_1.4fr_auto] md:items-start">
              <Field label={`Question ${i + 1}`} htmlFor={`faq-q-${item.id}`}>
                <Input
                  id={`faq-q-${item.id}`}
                  value={item.question}
                  onChange={(e) => set("faq", draft.faq.map((f) => (f.id === item.id ? { ...f, question: e.target.value } : f)))}
                />
              </Field>
              <Field label="Answer" htmlFor={`faq-a-${item.id}`}>
                <Textarea
                  id={`faq-a-${item.id}`}
                  value={item.answer}
                  rows={3}
                  onChange={(e) => set("faq", draft.faq.map((f) => (f.id === item.id ? { ...f, answer: e.target.value } : f)))}
                />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="md:mt-7"
                aria-label={`Remove question ${i + 1}`}
                onClick={() => set("faq", draft.faq.filter((f) => f.id !== item.id))}
              >
                <Trash2 size={15} />
              </Button>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
