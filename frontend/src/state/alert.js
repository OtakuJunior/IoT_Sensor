import { create } from "zustand";
import { persist } from "zustand/middleware";

function toArray(v) {
  if (Array.isArray(v)) return v.slice();
  try {
    return v && typeof v[Symbol.iterator] === "function" ? Array.from(v) : [];
  } catch {
    return [];
  }
}

export const useAlerts = create(
  persist(
    (set, get) => ({
      log: [],
      acked: [],
      audit: [],

      push: (alert) => {
        const entry = { ...alert, id: alert.id };
        const nextLog = [entry, ...(get().log || [])].slice(0, 200);
        set({ log: nextLog });
      },

      ack(id, user) {
        const ts = Date.now();
        set((s) => {
          const prev = toArray(s.acked);
          if (!prev.includes(id)) prev.push(id);
          const audit = [
            { action: "ack", id, user, ts },
            ...(s.audit || []),
          ].slice(0, 500);
          return { acked: prev, audit };
        });
      },

      sync: async (fetchFromDB) => {
        const dbAlerts = await fetchFromDB();
        const currentIds = new Set((get().log || []).map((a) => a.id));
        const missing = dbAlerts.filter((a) => !currentIds.has(a.id));
        if (missing.length === 0) return;
        const merged = [...missing, ...(get().log || [])]
          .sort(
            (a, b) =>
              new Date(b.time || b.timestamp) - new Date(a.time || a.timestamp)
          )
          .slice(0, 200);
        set({ log: merged });
      },
    }),
    { name: "alerts-log" }
  )
);
