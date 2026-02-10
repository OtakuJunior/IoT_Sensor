import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSensorData } from "../state/sensorData";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { history, currentValue, setInitialHistory, addSensorValue, clear } =
    useSensorData();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const ws = useRef(null);

  useEffect(() => {
    const fetchSensorAndHistory = async () => {
      try {
        const [sensorRes, historyRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/sensors/${id}`),
          fetch(`http://127.0.0.1:8000/sensor_data/${id}/history`),
        ]);

        const sensorDataFetched = await sensorRes.json();
        const historyData = await historyRes.json();

        setSensor(sensorDataFetched);

        const formattedHistory = historyData.map((point) => ({
          time: new Date(point.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          value: point.value,
          rawTime: point.time,
        }));

        setInitialHistory(formattedHistory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };

    fetchSensorAndHistory();

    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      ws.current = new WebSocket(`ws://localhost:8000/ws/${id}`);

      ws.current.onopen = () => {
        console.log("✅ WebSocket Connected");
        setIsLive(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (String(data.sensor_id) === String(id)) {
            addSensorValue({
              time: new Date(data.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              value: data.value,
              rawTime: data.time,
            });
          }
        } catch (err) {
          console.error("WebSocket Message Error:", err);
        }
      };

      ws.current.onclose = () => setIsLive(false);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      clear();
    };
  }, [id, setInitialHistory, addSensorValue, clear]);

  if (loading)
    return <div className="p-8 text-slate-500">Loading details...</div>;
  if (!sensor) return <div className="p-8 text-red-500">Sensor not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-blue-600 mb-2"
          >
            ← Back to list
          </button>
          <h1 className="text-3xl font-bold text-slate-800">{sensor.name}</h1>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              isLive
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isLive ? "📡 LIVE" : "🔌 CONNECTING..."}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-gray-500 text-sm font-medium">Current Value</h3>
          <div className="text-4xl font-bold text-slate-900 mt-2">
            {currentValue ? currentValue.value.toFixed(2) : "--"}
          </div>
          <h3 className="text-gray-500 text-sm font-medium mt-4">
            Last Update
          </h3>
          <div className="text-lg font-semibold text-slate-600">
            {currentValue?.rawTime
              ? new Date(currentValue.rawTime).toLocaleString("fr-FR")
              : "--"}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-gray-500 text-sm font-medium">Sensor Type</h3>
          <div className="text-2xl font-semibold text-slate-700 mt-2 capitalize">
            {sensor.sensor_type || "Generic"}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-gray-500 text-sm font-medium">Database ID</h3>
          <div className="text-2xl font-mono text-slate-400 mt-2">
            #{sensor.id}
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">
          Real-time History
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={["auto", "auto"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
