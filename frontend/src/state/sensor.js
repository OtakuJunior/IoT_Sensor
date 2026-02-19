import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useSensor = create(
  persist(
    (set) => ({
      sensors: [],
      loadSensors: async () => {
        try {
          const allSensors = await api.getSensors();
          set({ sensors: allSensors });
        } catch (e) {
          console.error(e);
        }
      },
    }),
    { name: "sensors_list" }
  )
);
