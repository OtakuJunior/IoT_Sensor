import { create } from "zustand";

export const useSensorData = create((set) => ({
  dataBySensor: {},

  setInitialHistory: (id, data, aggregated = false) =>
    set((state) => ({
      dataBySensor: {
        ...state.dataBySensor,
        [id]: {
          history: data,
          current: data[data.length - 1] || null,
          isAggregated: aggregated,
        },
      },
    })),

  addSensorValue: (id, point) =>
    set((state) => {
      const existingData = state.dataBySensor[id];

      if (
        !existingData ||
        existingData.history === undefined ||
        existingData.isAggregated
      ) {
        return {
          dataBySensor: {
            ...state.dataBySensor,
            [id]: {
              ...existingData,
              current: point,
            },
          },
        };
      }

      const newHistory = [...existingData.history, point].slice(-75);
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

  clearSensor: (id) =>
    set((state) => {
      const next = { ...state.dataBySensor };
      delete next[id];
      return { dataBySensor: next };
    }),

  clear: () => set({ dataBySensor: {} }),
}));
