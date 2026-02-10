import { create } from "zustand";

export const useSensorData = create((set) => ({
  history: [],
  currentValue: null,

  setInitialHistory: (data) => set({ history: data }),

  addSensorValue: (point) =>
    set((state) => {
      const newHistory = [...state.history, point].slice(-50);
      return {
        history: newHistory,
        currentValue: point,
      };
    }),

  clear: () => set({ history: [], currentValue: null }),
}));
