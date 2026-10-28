"use client";

import { useState } from "react";
import { resetDemo, useStore } from "@/lib/store";

export function DemoBar() {
  const state = useStore();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-board font-mono text-[0.6875rem] text-board-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-[max(16px,env(safe-area-inset-left))] py-1.5">
        <p>
          <span className="mr-2 bg-tape px-1 text-tape-ink">DEMO</span>
          Sample data. Changes are saved in this browser only.
          <span className="hidden sm:inline"> Member: member@larkspur.demo / demo1234 · Admin: admin@larkspur.demo / admin1234</span>
        </p>
        {state &&
          (confirming ? (
            <span className="flex items-center gap-2">
              Reset all demo data?
              <button
                className="font-medium underline"
                onClick={() => {
                  resetDemo();
                  setConfirming(false);
                  window.location.href = "/";
                }}
              >
                Reset
              </button>
              <button className="underline" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </span>
          ) : (
            <button className="underline" onClick={() => setConfirming(true)}>
              Reset demo
            </button>
          ))}
      </div>
    </div>
  );
}
