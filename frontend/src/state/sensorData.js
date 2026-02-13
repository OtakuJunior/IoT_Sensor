import { create } from "zustand";

export const useSensorData = create((set) => ({
  dataBySensor: {},
  setInitialHistory: (id, data) =>
    set((state) => ({
      dataBySensor: {
        ...state.dataBySensor,
        [id]: {
          history: data.slice(-50),
          current: data[data.length - 1] || null,
        },
      },
    })),

  addSensorValue: (id, point) =>
    set((state) => {
      const existingData = state.dataBySensor[id] || {
        history: [],
        current: null,
      };

      const newHistory = [...existingData.history, point].slice(-50);

      return {
        dataBySensor: {
          ...state.dataBySensor,
          [id]: {
            history: newHistory,
            current: point,
          },
        },
      };
    }),

  clear: () => set({ dataBySensor: {} }),
}));
