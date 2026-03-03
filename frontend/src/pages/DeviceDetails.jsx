import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSensorData } from "../state/sensorData";
import { api } from "../services/api";
import { useSensor } from "../state/sensor";
import { useAlerts } from "../state/alert";
import { getSensorInfos } from "../lib/sensorInfos";
import KpiCard from "../components/kpiCard";
import GaugeTile from "../components/gaugeTile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DetailTile({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider w-full text-left mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { log } = useAlerts();
  const hasActiveAlert = log.some(
    (alert) => alert.sensor_id === id && !alert.is_resolved
  );
  const sensors = useSensor((state) => state.sensors);
  const sensorInfo = getSensorInfos(sensors, id);
  const [loading, setLoading] = useState(true);

  const sensorData = useSensorData((state) => state.dataBySensor[id]);
  const setInitialHistory = useSensorData((state) => state.setInitialHistory);
  const [kpis, setKpis] = useState(null);

  const sensorAlerts = useMemo(() => {
    return (log || []).filter((alert) => alert.sensor_id === id);
  }, [id, log]);

  const latestAlertTime =
    sensorAlerts?.length > 0
      ? new Date(
          sensorAlerts[0].time || sensorAlerts[0].timestamp
        ).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--";

  useEffect(() => {
    const fetchSensorAndHistory = async () => {
      try {
        const historyData = await api.getSensorHistory(id);
        const formattedHistory = historyData.map((point) => ({
          time: new Date(point.ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          value: point.value,
          rawTime: point.ts,
        }));

        setInitialHistory(id, formattedHistory);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    const fetchkpis = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      try {
        const data = await api.getSensorKpis(id, {
          fromTime: startOfDay.toISOString(),
          endTime: new Date().toISOString(),
        });
        setKpis(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSensorAndHistory();
    fetchkpis();
  }, [id, setInitialHistory]);

  if (loading)
    return <div className="p-8 text-slate-500">Loading details...</div>;
  if (!sensorInfo)
    return <div className="p-8 text-red-500">Sensor not found.</div>;

  const history = sensorData?.history || [];
  const currentValue = sensorData?.current || null;
  const isLive = true;

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
          <h1 className="text-3xl font-bold text-slate-800">
            {sensorInfo.name}
          </h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Current Value"
          value={currentValue?.value ? currentValue.value : "--"}
        />
        <KpiCard
          title="Last Update"
          value={currentValue?.time ? currentValue.time : "--"}
        />
        <KpiCard
          title="Alert"
          value={hasActiveAlert ? "Active" : "Inactive"}
          titleColor={hasActiveAlert ? "text-red-600" : "text-green-600"}
          valueColor={hasActiveAlert ? "text-red-600" : "text-green-600"}
        />
        <KpiCard
          title="Last Alert"
          value={latestAlertTime}
          titleColor="text-blue-700"
          valueColor="text-blue-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className=" bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Real-time History
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[10, 70]} />
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
        <div>
          <GaugeTile
            title="Average"
            value={kpis?.avg ?? "--"}
            unit={sensorInfo.unit || ""}
            color="#3b82f6"
            min={0}
            max={100}
          />
          <KpiCard title="Min" value={kpis?.min ?? "--"} />
          <KpiCard title="Max" value={kpis?.max ?? "--"} />
        </div>
      </div>
    </div>
  );
}
