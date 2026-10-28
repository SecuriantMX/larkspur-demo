"use client";

import { defaultContent, defaultPlans, defaultSpaces } from "./content";
import { useStore } from "./store";

// Public pages render the default copy on the server, then switch to whatever the admin published.
export function usePublicData() {
  const state = useStore();
  return {
    content: state?.content ?? defaultContent,
    plans: (state?.plans ?? defaultPlans).filter((p) => p.active),
    spaces: (state?.spaces ?? defaultSpaces).filter((s) => s.active),
    user: state?.sessionUserId ? state.users.find((u) => u.id === state.sessionUserId) ?? null : null,
  };
}
