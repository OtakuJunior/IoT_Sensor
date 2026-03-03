import React, { useEffect, useMemo, useCallback } from "react";
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

  const sensorData = useSensorData((state) => state.dataBySensor[id]);
  const setInitialHistory = useSensorData((state) => state.setInitialHistory);
  const clear = useSensorData((state) => state.clear);
  const loading = !sensorData?.history?.length;

  //const [kpis, setKpis] = useState(null);

  const localKpis = useMemo(() => {
    const history = sensorData?.history;
    if (!history || history.length === 0) {
      return { min: null, max: null, avg: null };
    }
    const values = history.map((item) => item.value);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, curr) => acc + curr, 0) / values.length;

    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      avg: Number(avg.toFixed(2)),
    };
  }, [sensorData?.history]);

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

  const fetchSensorAndHistory = useCallback(async () => {
    if (sensorData?.history?.length > 0) {
      return;
    }
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
    } catch (error) {
      console.error(error);
    }
  }, [id, setInitialHistory, sensorData?.history]);

  /* const fetchkpis = async () => {
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
    }; */

  //fetchkpis();

  useEffect(() => {
    fetchSensorAndHistory();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clear();
        fetchSensorAndHistory();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchSensorAndHistory, clear]);

  if (loading)
    return <div className="p-8 text-slate-500">Loading details...</div>;
  if (!sensorInfo)
    return <div className="p-8 text-red-500">Sensor not found.</div>;
  const currentValue = sensorData?.current || null;
  const history = sensorData?.history;

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
          <div className="flex flex-row justify-start">
            <h1 className="text-3xl font-bold text-slate-800">
              {sensorInfo.name}
            </h1>
            <span className="self-center ml-6">
              Sensor type: {sensorInfo.sensor_type}
            </span>
            <div className="flex flex-row justify-between gap-3 font-light self-center pl-6">
              <span>
                min warning:{" "}
                {sensorInfo?.min_warning
                  ? sensorInfo.min_warning.toFixed(2)
                  : "/"}
              </span>
              <span>
                min critical:{" "}
                {sensorInfo?.min_critical
                  ? sensorInfo.min_critical.toFixed(2)
                  : "/"}
              </span>
              <span>
                max warning:{" "}
                {sensorInfo?.max_warning
                  ? sensorInfo.max_warning.toFixed(2)
                  : "/"}
              </span>
              <span>
                max critical:{" "}
                {sensorInfo?.max_critical
                  ? sensorInfo.max_critical.toFixed(2)
                  : "/"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Current Value"
          value={currentValue?.value ? currentValue.value.toFixed(2) : "--"}
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
          <h3 className="text-lg font-bold text-slate-800 mb-6 p-2">History</h3>
          <div className="h-72 w-full">
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
            value={localKpis?.avg ? localKpis.avg : "--"}
            unit={sensorInfo.unit || ""}
            color="#3b82f6"
            min={0}
            max={100}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {" "}
            <KpiCard
              title="Min Value"
              value={localKpis?.min ? localKpis.min : "--"}
            />
            <KpiCard
              title="Max Value"
              value={localKpis?.max ? localKpis.max : "--"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
