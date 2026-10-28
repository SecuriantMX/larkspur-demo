"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { X } from "lucide-react";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
export { cx };

type Variant = "primary" | "secondary" | "ghost" | "danger" | "tape";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-tape hover:text-tape-ink border-2 border-accent hover:border-tape",
  secondary: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink-soft hover:text-ink hover:bg-sunken",
  danger: "border-2 border-bad text-bad hover:bg-bad hover:text-paper",
  tape: "border-2 border-tape bg-tape text-tape-ink hover:border-paper hover:bg-paper hover:text-ink",
};
const sizes = {
  sm: "h-8 px-3 text-[0.95rem]",
  md: "h-10 px-4 text-[1.05rem]",
  lg: "h-13 px-6 text-xl",
};
const buttonBase =
  "inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof sizes }) {
  return (
    <button
      className={cx(
        buttonBase,
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof sizes }) {
  return (
    <Link
      className={cx(
        buttonBase,
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="eyebrow text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

const control =
  "w-full border border-line border-b-2 border-b-ink bg-surface px-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none focus:shadow-[0_3px_0_0_var(--tape)]";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(control, "min-h-24 py-2 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cx(control, "h-10", className)} {...props} />;
}

type Tone = "neutral" | "accent" | "good" | "warn" | "bad";
const tones: Record<Tone, string> = {
  neutral: "border-line text-ink-soft",
  accent: "border-tape bg-tape text-tape-ink",
  good: "border-good text-good",
  warn: "border-warn bg-warn-soft text-warn",
  bad: "border-bad text-bad",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex h-[1.375rem] items-center border px-1.5 font-mono text-[0.625rem] font-medium tracking-wider whitespace-nowrap uppercase",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx("border border-line bg-surface", className)}>{children}</section>;
}

export function PanelHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-5 py-3">
      <h2 className="eyebrow font-medium">{title}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
      <div className="min-w-0">
        <h1 className="sign text-5xl sm:text-6xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="sign text-2xl">{title}</p>
      <p className="max-w-sm text-sm text-ink-soft">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="relative overflow-x-auto">{children}</div>;
}

export const th = "px-5 py-2.5 text-left font-mono text-[0.625rem] font-medium uppercase tracking-wider text-ink-soft whitespace-nowrap";
export const td = "px-5 py-3 text-sm align-middle";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] border-2 border-ink border-t-[6px] border-t-tape bg-surface p-0 text-ink shadow-[8px_8px_0_0_var(--ink)] backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="sign text-2xl">{title}</h2>
        <button onClick={onClose} className="p-1 text-ink-soft hover:bg-sunken hover:text-ink" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
    </dialog>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-l-4 border-bad bg-bad-soft px-3 py-2 text-sm text-bad">
      {message}
    </p>
  );
}

export function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-soft" aria-live="polite">
      Loading…
    </div>
  );
}
