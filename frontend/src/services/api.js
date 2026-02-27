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

  getSensorKpis: async (sensorId) => {
    const response = await apiC.get(`sensor_data/${sensorId}/kpis`);
    return response.data;
  },
};
