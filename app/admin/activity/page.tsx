"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button, EmptyState, Input, PageHeader, Panel, Select, TableWrap, cx, td, th } from "@/components/ui";
import { dateTime, downloadCsv } from "@/lib/format";
import { useAuthed } from "@/lib/store";

const PAGE = 40;

export default function AdminActivity() {
  const session = useAuthed();
  const [action, setAction] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  if (!session) return null;
  const { state } = session;
  const actions = Array.from(new Set(state.activity.map((a) => a.action))).sort();
  const q = query.trim().toLowerCase();
  const list = state.activity.filter(
    (a) =>
      (action === "all" || a.action === action) &&
      (!q || a.actorName.toLowerCase().includes(q) || a.detail.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader
        title="Activity log"
        description="Who did what, and when. Kept for audits and support."
        action={
          <Button
            variant="secondary"
            disabled={!list.length}
            onClick={() =>
              downloadCsv(
                "activity-log.csv",
                list.map((a) => ({ time: a.createdAt, actor: a.actorName, action: a.action, detail: a.detail })),
              )
            }
          >
            <Download size={16} /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <label htmlFor="activity-search" className="sr-only">
          Search activity
        </label>
        <Input
          id="activity-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by person or detail"
          className="min-w-0 flex-1 basis-64"
        />
        <label htmlFor="activity-action" className="sr-only">
          Action
        </label>
        <Select id="activity-action" value={action} onChange={(e) => setAction(e.target.value)} className="w-auto">
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <Panel>
        {list.length ? (
          <>
            <TableWrap>
              <table className="w-full min-w-[40rem]">
                <thead className="border-b border-line">
                  <tr>
                    <th className={th}>Time</th>
                    <th className={th}>Who</th>
                    <th className={th}>Action</th>
                    <th className={th}>Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {list.slice(0, limit).map((a) => (
                    <tr key={a.id}>
                      <td className={cx(td, "font-mono text-xs whitespace-nowrap text-ink-soft")}>{dateTime(a.createdAt)}</td>
                      <td className={cx(td, "whitespace-nowrap")}>{a.actorName}</td>
                      <td className={cx(td, "whitespace-nowrap")}>{a.action}</td>
                      <td className={cx(td, "text-ink-soft")}>{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            {list.length > limit && (
              <div className="border-t border-line px-5 py-3">
                <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
                  Show more ({list.length - limit} left)
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="Nothing logged" body="No entries match this search." />
        )}
      </Panel>
    </>
  );
}
