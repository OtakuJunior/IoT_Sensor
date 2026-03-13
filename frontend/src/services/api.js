import axios from "axios";
import { getAccessToken } from "./oidc";

const apiC = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

apiC.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  getSensors: async () => {
    const response = await apiC.get("/sensors");
    return response.data;
  },

  getSensor: async (sensorId) => {
    const response = await apiC.get(`/sensors/${sensorId}`);
    return response.data;
  },

  getSensorHistory: async (sensorId, { fromTime, endTime, bucketMs } = {}) => {
    const params = new URLSearchParams();
    if (bucketMs !== undefined) params.append("bucket_ms", bucketMs);
    if (fromTime) params.append("from_time", fromTime);
    if (endTime) params.append("end_time", endTime);

    const response = await apiC.get(
      `/sensor_data/${sensorId}/history?${params}`
    );
    return response.data;
  },

  getAlerts: async () => {
    const response = await apiC.get("/alerts");
    return response.data;
  },

  getSensorKpis: async (sensorId, { fromTime, endTime } = {}) => {
    const params = new URLSearchParams();
    if (fromTime) params.append("from_time", fromTime);
    if (endTime) params.append("to_time", endTime);
    const response = await apiC.get(`/sensor_data/${sensorId}/kpis?${params}`);
    return response.data;
  },

  getLocations: async () => {
    const response = await apiC.get("/locations");
    return response.data;
  },

  getAssets: async () => {
    const response = await apiC.get("/assets");
    return response.data;
  },

  addSensor: async (payload) => {
    return await apiC.post("/sensors", payload);
  },

  deleteSensor: async (id) => {
    return await apiC.delete(`/sensors/${id}`);
  },

  addLocation: async (payload) => {
    return await apiC.post("/locations", payload);
  },

  updateSensor: async (id, payload) => {
    return await apiC.patch(`/sensors/${id}`, payload);
  },

  getUsers: async () => {
    const response = await apiC.get("/users");
    return response.data;
  },

  deleteUser: async (id) => {
    return await apiC.delete(`/users/${id}}`);
  },

  getMe: async () => {
    return await apiC.get("/auth/me");
  },

  addAsset: async (payload) => {
    return await apiC.post("/assets", payload);
  },

  updateAsset: async (id, payload) => {
    return await apiC.patch(`/assets/${id}`, payload);
  },

  deleteAsset: async (id) => {
    return await apiC.delete(`/assets/${id}`);
  },
};
