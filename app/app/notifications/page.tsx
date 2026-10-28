"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Button, EmptyState, PageHeader, Panel, cx } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { markNotificationsRead, useAuthed } from "@/lib/store";

export default function NotificationsPage() {
  const session = useAuthed();
  if (!session) return null;
  const { state, user } = session;
  const notes = state.notifications.filter((n) => n.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = notes.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Everything here is also sent to your email."
        action={
          <Button variant="secondary" disabled={!unread} onClick={() => markNotificationsRead()}>
            Mark all as read
          </Button>
        }
      />
      <Panel>
        {notes.length ? (
          <ul className="divide-y divide-line">
            {notes.map((n) => (
              <li key={n.id} className={cx("flex items-start gap-3 px-5 py-4", !n.read && "border-l-4 border-tape")}>
                <span className={cx("mt-1.5 h-2 w-2 shrink-0", n.read ? "bg-transparent" : "bg-brick")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-ink-soft">{n.body}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
                    {dateTime(n.createdAt)}
                    {n.emailed && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> Emailed
                      </span>
                    )}
                  </p>
                </div>
                {n.href && (
                  <Link
                    href={n.href}
                    onClick={() => markNotificationsRead([n.id])}
                    className="shrink-0 text-sm font-medium text-accent"
                  >
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No notifications" body="Booking confirmations, receipts and support replies will show up here." />
        )}
      </Panel>
    </>
  );
}
