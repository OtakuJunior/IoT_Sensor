import axios from "axios";
import { Await } from "react-router-dom";

const apiC = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

export const api = {
  getSensors: async () => {
    const response = await apiC.get("/sensors");
    return response.data;
  },

  getSensor: async (sensor_id) => {
    const response = await apiC.get(`/sensors/${sensor_id}`);
    return response.data;
  },

  getSensorHistory: async (sensor_id) => {
    const response = await apiC.get(`/sensor_data/${sensor_id}/history`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await apiC.get("/alerts");
    return response.data;
  },
};
