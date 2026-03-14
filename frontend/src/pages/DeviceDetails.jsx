import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSensorData } from "../state/sensorData";
import { api } from "../services/api";
import { useSensor } from "../state/sensor";
import { useAlerts } from "../state/alert";
import { getSensorInfos } from "../lib/sensorInfos";
import KpiCard from "../components/kpiCard";
import GaugeTile from "../components/gaugeTile";
import { MdOutlineLocationOn } from "react-icons/md";
import {
  LineChart,
  ReferenceLine,
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

const HISTORY_WINDOWS = [
  { label: "1h", value: 60 },
  { label: "6h", value: 360 },
  { label: "12h", value: 720 },
  { label: "24h", value: 1440 },
];

function getBucketMs(historyWindow) {
  if (historyWindow <= 60) return 0;
  if (historyWindow <= 720) return 60_000;
  return 300_000;
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
  const [locations, setLocations] = useState([]);
  const [historyWindow, setHistoryWindow] = useState(60);

  const sensorData = useSensorData((state) => state.dataBySensor[id]);
  const setInitialHistory = useSensorData((state) => state.setInitialHistory);
  const clearSensor = useSensorData((state) => state.clearSensor);

  const [isFetching, setIsFetching] = useState(false);
  const loading = sensorData?.history === undefined && !isFetching;

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

  const fetchingRef = useRef(false);

  const fetchSensorAndHistory = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true); // ← indique qu'un fetch est en cours
    try {
      clearSensor(id);
      const now = new Date();
      const fromTime = new Date(now - historyWindow * 60 * 1000);
      const bucketMs = getBucketMs(historyWindow);

      const historyData = await api.getSensorHistory(id, {
        fromTime: fromTime.toISOString(),
        endTime: now.toISOString(),
        ...(bucketMs > 0 && { bucketMs }),
      });

      const formattedHistory = historyData.map((point) => ({
        time: new Date(point.ts).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        value: point.value ?? point.avg,
        rawTime: point.ts,
      }));
      setInitialHistory(id, formattedHistory, bucketMs > 0);
    } catch (error) {
      console.error(error);
      setInitialHistory(id, []);
    } finally {
      fetchingRef.current = false;
      setIsFetching(false); // ← fetch terminé
    }
  }, [id, setInitialHistory, clearSensor, historyWindow]);

  useEffect(() => {
    fetchSensorAndHistory();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSensorAndHistory();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchSensorAndHistory]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const data = await api.getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Erreur lors du chargement des localisations:", error);
      }
    }
    fetchLocations();
  }, []);

  const locationName = useMemo(() => {
    if (!sensorInfo || !locations.length) return "Unassigned";
    const loc = locations.find((l) => l.id === sensorInfo.location_id);
    return loc ? loc.name : "Unknown Location";
  }, [sensorInfo, locations]);

  if (loading)
    return <div className="p-8 text-slate-500">Loading details...</div>;
  if (!sensorInfo)
    return <div className="p-8 text-red-500">Sensor not found.</div>;

  const currentValue = sensorData?.current || null;
  const history = sensorData?.history || [];
  console.log("history points:", sensorData?.history?.length ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] w-full">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-blue-600 mb-2"
          >
            ← Back to list
          </button>
          <div className="flex flex-row justify-start">
            <h1 className="text-lg font-bold text-slate-800">
              {sensorInfo.name}
            </h1>
            <span className="self-center ml-6">
              <MdOutlineLocationOn className="ml-2.5" /> {locationName}
            </span>
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
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between p-2 mb-4">
            <h3 className="text-lg font-bold text-slate-800">History</h3>
            <div className="flex gap-2">
              {HISTORY_WINDOWS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setHistoryWindow(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    historyWindow === value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={12}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  domain={["auto", "auto"]}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                {sensorInfo?.min_critical && (
                  <ReferenceLine
                    y={sensorInfo.min_critical}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{
                      position: "right",
                      value: "Min Crit",
                      fill: "#ef4444",
                      fontSize: 10,
                    }}
                  />
                )}
                {sensorInfo?.min_warning && (
                  <ReferenceLine
                    y={sensorInfo.min_warning}
                    stroke="#eab308"
                    strokeDasharray="5 5"
                    label={{
                      position: "right",
                      value: "Min Warn",
                      fill: "#eab308",
                      fontSize: 10,
                    }}
                  />
                )}
                {sensorInfo?.max_warning && (
                  <ReferenceLine
                    y={sensorInfo.max_warning}
                    stroke="#eab308"
                    strokeDasharray="5 5"
                    label={{
                      position: "right",
                      value: "Max Warn",
                      fill: "#eab308",
                      fontSize: 10,
                    }}
                  />
                )}
                {sensorInfo?.max_critical && (
                  <ReferenceLine
                    y={sensorInfo.max_critical}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{
                      position: "right",
                      value: "Max Crit",
                      fill: "#ef4444",
                      fontSize: 10,
                    }}
                  />
                )}
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
