"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultSpaces } from "@/lib/content";
import { useStore } from "@/lib/store";
import type { Booking, Space } from "@/lib/types";

type Rect = { x: number; y: number; w: number; h: number };
type Fixture = Rect & { label: string; kind?: "stairs" | "plain" };

// Drawn in plan units (1 unit ≈ 4 in). Only the geometry lives here; names, rates and state come from data.
const FLOORS: Array<{ name: string; rooms: Record<string, Rect>; fixtures: Fixture[]; door: { x: number; y: number } }> = [
  {
    name: "Ground floor",
    rooms: {
      "1A": { x: 8, y: 8, w: 124, h: 96 },
      "1C": { x: 140, y: 8, w: 152, h: 128 },
    },
    fixtures: [
      { x: 8, y: 112, w: 124, h: 100, label: "Lobby · front desk" },
      { x: 140, y: 144, w: 56, h: 68, label: "Stairs", kind: "stairs" },
      { x: 204, y: 144, w: 88, h: 68, label: "WC" },
    ],
    door: { x: 50, y: 212 },
  },
  {
    name: "Second floor",
    rooms: {
      "2A": { x: 8, y: 8, w: 92, h: 84 },
      "2B": { x: 108, y: 8, w: 92, h: 84 },
      "2D": { x: 8, y: 100, w: 192, h: 112 },
    },
    fixtures: [
      { x: 208, y: 8, w: 84, h: 128, label: "Kitchen" },
      { x: 208, y: 144, w: 84, h: 68, label: "Stairs", kind: "stairs" },
    ],
    door: { x: -1, y: -1 },
  },
];

const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: ms % 3_600_000 ? "2-digit" : undefined });

function roomState(space: Space, bookings: Booking[], now: number | null) {
  if (now === null) return { busy: false, line: "" };
  const hour = new Date(now).getHours();
  if (hour < 7 || hour >= 20) return { busy: false, line: "Closed · 7 AM" };
  const mine = bookings
    .filter((b) => b.spaceId === space.id && b.status === "confirmed")
    .map((b) => ({ s: Date.parse(b.start), e: Date.parse(b.end) }));
  const current = mine.find((b) => b.s <= now && b.e > now);
  if (current) return { busy: true, line: `Busy till ${fmtTime(current.e)}` };
  const endOfDay = new Date(now).setHours(20, 0, 0, 0);
  const next = mine.filter((b) => b.s > now && b.s < endOfDay).sort((a, b) => a.s - b.s)[0];
  return { busy: false, line: next ? `Free till ${fmtTime(next.s)}` : "Free rest of day" };
}

export function FloorPlan() {
  const state = useStore();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const spaces = (state?.spaces ?? defaultSpaces).filter((s) => s.active);
  const bookings = state?.bookings ?? [];
  const placed = new Set(FLOORS.flatMap((f) => Object.keys(f.rooms)));
  const unplaced = spaces.filter((s) => !placed.has(s.unit));
  const inUse = spaces.filter((s) => roomState(s, bookings, now).busy).length;

  return (
    <figure className="border-2 border-ink bg-surface">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <pattern id="plan-hazard" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <rect width="8" height="8" fill="var(--surface)" />
            <rect width="4" height="8" fill="var(--brick)" opacity="0.55" />
          </pattern>
          <pattern id="plan-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" stroke="var(--line)" strokeWidth="0.4" />
          </pattern>
        </defs>
      </svg>

      <div className="grid divide-y-2 divide-ink md:grid-cols-2 md:divide-x-2 md:divide-y-0">
        {FLOORS.map((floor, fi) => (
          <div key={floor.name} className="relative">
            <p className="eyebrow absolute top-2 left-3 text-ink-soft">
              {fi === 0 ? "L1" : "L2"} · {floor.name}
            </p>
            <svg viewBox="-6 -6 312 248" className="mt-6 block h-auto w-full" role="group" aria-label={`${floor.name} plan`}>
              <rect x="-6" y="-6" width="312" height="248" fill="url(#plan-grid)" />
              <rect x="0" y="0" width="300" height="220" fill="none" stroke="var(--ink)" strokeWidth="5" />

              {floor.fixtures.map((f) => (
                <g key={f.label + f.x}>
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="var(--sunken)" stroke="var(--ink)" strokeWidth="1.2" />
                  {f.kind === "stairs" &&
                    Array.from({ length: 7 }, (_, i) => (
                      <line
                        key={i}
                        x1={f.x}
                        x2={f.x + f.w}
                        y1={f.y + ((i + 1) * f.h) / 8}
                        y2={f.y + ((i + 1) * f.h) / 8}
                        stroke="var(--ink-soft)"
                        strokeWidth="0.8"
                      />
                    ))}
                  <text
                    x={f.x + f.w / 2}
                    y={f.y + f.h / 2 + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fill="var(--ink-soft)"
                    className="font-mono"
                    style={{ textTransform: "uppercase" }}
                  >
                    {f.label}
                  </text>
                </g>
              ))}

              {floor.door.x > 0 && (
                <g>
                  <line x1={floor.door.x - 18} x2={floor.door.x + 18} y1="220" y2="220" stroke="var(--surface)" strokeWidth="6" />
                  <path d={`M${floor.door.x - 18} 220 A36 36 0 0 1 ${floor.door.x + 18} 220`} fill="none" stroke="var(--ink-soft)" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text x={floor.door.x} y="234" textAnchor="middle" fontSize="7.5" fill="var(--ink)" className="font-mono">
                    MAIN ST ENTRY
                  </text>
                </g>
              )}

              {Object.entries(floor.rooms).map(([unit, r]) => {
                const space = spaces.find((s) => s.unit === unit);
                if (!space) {
                  return <rect key={unit} x={r.x} y={r.y} width={r.w} height={r.h} fill="var(--sunken)" stroke="var(--ink)" strokeWidth="1.2" />;
                }
                const st = roomState(space, bookings, now);
                return (
                  <Link key={unit} href="/services" aria-label={`${space.name}, unit ${unit}. ${st.line}`} className="group">
                    <rect
                      x={r.x}
                      y={r.y}
                      width={r.w}
                      height={r.h}
                      fill={st.busy ? "url(#plan-hazard)" : "var(--surface)"}
                      stroke="var(--ink)"
                      strokeWidth="1.6"
                      className="transition-[fill] group-hover:fill-[var(--tape)]"
                    />
                    {unit === "2D" &&
                      Array.from({ length: 8 }, (_, i) => (
                        <rect
                          key={i}
                          x={r.x + 14 + (i % 4) * 44}
                          y={r.y + 58 + Math.floor(i / 4) * 24}
                          width="30"
                          height="14"
                          fill="none"
                          stroke="var(--ink-soft)"
                          strokeWidth="0.8"
                        />
                      ))}
                    {st.busy && <rect x={r.x + 4} y={r.y + 4} width={Math.min(r.w - 8, 112)} height="50" fill="var(--surface)" />}
                    <rect x={r.x + 6} y={r.y + 6} width="22" height="13" fill="var(--ink)" />
                    <text x={r.x + 17} y={r.y + 15.5} textAnchor="middle" fontSize="8" fill="var(--paper)" className="font-mono">
                      {unit}
                    </text>
                    <text
                      x={r.x + 7}
                      y={r.y + 36}
                      fontSize="15"
                      fontWeight="800"
                      fill="var(--ink)"
                      className="font-display"
                      style={{ textTransform: "uppercase" }}
                    >
                      {space.name.replace(/ (Room|Studio|Desk)$/, "")}
                    </text>
                    <text x={r.x + 7} y={r.y + 48} fontSize="7" fill="var(--ink-soft)" className="font-mono">
                      {space.capacity} seat{space.capacity > 1 ? "s" : ""} · ${(space.hourlyRate / 100).toFixed(0)}/h
                    </text>
                    {st.line && (
                      <g>
                        <rect
                          x={r.x + 6}
                          y={r.y + r.h - 19}
                          width={Math.min(r.w - 12, st.line.length * 4.6 + 10)}
                          height="13"
                          fill={st.busy ? "var(--brick)" : "var(--tape)"}
                        />
                        <text
                          x={r.x + 11}
                          y={r.y + r.h - 10}
                          fontSize="7"
                          fontWeight="500"
                          fill={st.busy ? "var(--paper)" : "var(--tape-ink)"}
                          className="font-mono"
                          style={{ textTransform: "uppercase" }}
                        >
                          {st.line}
                        </text>
                      </g>
                    )}
                  </Link>
                );
              })}
            </svg>
          </div>
        ))}
      </div>

      {unplaced.length > 0 && (
        <p className="border-t border-line px-3 py-2 text-xs text-ink-soft">
          Also bookable: {unplaced.map((s) => s.name).join(", ")}
        </p>
      )}

      <figcaption className="grid grid-cols-2 border-t-2 border-ink font-mono text-[0.625rem] uppercase sm:grid-cols-4">
        <span className="border-r border-line px-3 py-2">
          <span className="block text-ink-soft">Drawing</span>Live occupancy
        </span>
        <span className="px-3 py-2 sm:border-r sm:border-line">
          <span className="block text-ink-soft">As of</span>
          {now ? new Date(now).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"}
        </span>
        <span className="border-t border-r border-line px-3 py-2 sm:border-t-0">
          <span className="block text-ink-soft">Rooms in use</span>
          {now ? `${inUse} of ${spaces.length}` : "—"}
        </span>
        <span className="border-t border-line bg-ink px-3 py-2 text-paper sm:border-t-0">
          <span className="block opacity-60">Sheet</span>A-1 / 1720 E Main
        </span>
      </figcaption>
    </figure>
  );
}
