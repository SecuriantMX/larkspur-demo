"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { defaultSpaces } from "@/lib/content";

const OPEN = 8;
const CLOSE = 20;
const HOURS = Array.from({ length: CLOSE - OPEN }, (_, i) => OPEN + i);

export function AvailabilityBoard() {
  const state = useStore();
  // Read the clock after mount so server and browser time zones can't disagree during hydration.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const nowHour = now ? now.getHours() + now.getMinutes() / 60 : null;

  const spaces = (state?.spaces ?? defaultSpaces).filter((s) => s.active);
  const today = new Date(now ?? 0);
  today.setHours(0, 0, 0, 0);
  const dayStart = today.getTime();
  const dayEnd = dayStart + 86_400_000;
  const todays = (state?.bookings ?? []).filter(
    (b) => b.status === "confirmed" && Date.parse(b.start) < dayEnd && Date.parse(b.end) > dayStart,
  );
  const pct = (h: number) => ((Math.min(Math.max(h, OPEN), CLOSE) - OPEN) / (CLOSE - OPEN)) * 100;
  const hourOf = (iso: string) => (Date.parse(iso) - dayStart) / 3_600_000;

  return (
    <figure className="border-2 border-ink bg-surface p-4 sm:p-5">
      <figcaption className="mb-4 flex items-baseline justify-between gap-2">
        <span className="sign text-2xl">Today&apos;s sheet</span>
        <span className="font-mono text-xs text-ink-soft">
          {now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </figcaption>
      <div className="flex flex-col gap-2.5">
        <div className="ml-[7.75rem] flex justify-between font-mono text-[10px] text-ink-soft sm:ml-36">
          {[8, 11, 14, 17, 20].map((h) => (
            <span key={h}>{h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`}</span>
          ))}
        </div>
        {spaces.map((space) => (
          <div key={space.id} className="flex items-center gap-3">
            <div className="w-28 shrink-0 sm:w-33">
              <p className="truncate font-display text-base font-bold uppercase">
                <span className="mr-1.5 font-mono text-[0.625rem] font-normal text-ink-soft">{space.unit}</span>
                {space.name}
              </p>
              <p className="font-mono text-[10px] text-ink-soft">{space.capacity} seat{space.capacity > 1 ? "s" : ""}</p>
            </div>
            <div className="relative h-7 flex-1 overflow-hidden border border-line bg-paper">
              {HOURS.slice(1).map((h) => (
                <span key={h} className="absolute inset-y-0 w-px bg-line" style={{ left: `${pct(h)}%` }} />
              ))}
              {todays
                .filter((b) => b.spaceId === space.id)
                .map((b) => {
                  const left = pct(hourOf(b.start));
                  const width = pct(hourOf(b.end)) - left;
                  return width > 0 ? (
                    <span
                      key={b.id}
                      className="hazard absolute inset-y-0"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title="Booked"
                    />
                  ) : null;
                })}
              {nowHour !== null && nowHour > OPEN && nowHour < CLOSE && (
                <span className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: `${pct(nowHour)}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="eyebrow mt-4 flex gap-4 text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="hazard h-2.5 w-4" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 border border-line bg-paper" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-0.5 bg-ink" /> Now
        </span>
      </div>
    </figure>
  );
}
