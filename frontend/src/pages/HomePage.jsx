import React, { useEffect, useState, useMemo } from "react";
import KpiCard from "../components/kpiCard";
import { useAlerts } from "../state/alert";
import { useSensor } from "../state/sensor";
import { api } from "../services/api";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const { log, acked } = useAlerts();
  const sensors = useSensor((state) => state.sensors);

  const [chartData, setChartData] = useState([]);

  const kpis = useMemo(() => {
    const totalAlerts = log ? log.length : 0;
    const ackedAlerts = log
      ? log.filter((a) => (acked || []).includes(a.id)).length
      : 0;

    let lastAlertTime = "--";
    if (log && log.length > 0) {
      const latest = log[0];
      lastAlertTime = new Date(
        latest.time || latest.timestamp
      ).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const activeCount = sensors
      ? sensors.filter((s) => s.status === "Active").length
      : 0;

    return { totalAlerts, ackedAlerts, lastAlertTime, activeCount };
  }, [log, acked, sensors]);

  useEffect(() => {
    async function fetchClimateData() {
      const anchorNow = Date.now();
      if (!sensors || sensors.length === 0) return;

      const tempSensor = sensors.find((s) => s.sensor_type === "Temperature");
      const humSensor = sensors.find((s) => s.sensor_type === "Humidity");

      if (!tempSensor || !humSensor) return;

      const periodMs = 24 * 60 * 60 * 1000;
      const bucketMs = periodMs / 120;

      try {
        const [resTemp, resHum] = await Promise.all([
          api.getSensorHistory(tempSensor.id, {
            fromTime: new Date(anchorNow - periodMs).toISOString(),
            endTime: new Date(anchorNow).toISOString(),
            bucketMs,
          }),
          api.getSensorHistory(humSensor.id, {
            fromTime: new Date(anchorNow - periodMs).toISOString(),
            endTime: new Date(anchorNow).toISOString(),
            bucketMs,
          }),
        ]);

        const humMap = new Map(resHum.map((p) => [p.ts, p]));
        const merged = resTemp.map((p) => ({
          time: new Date(p.ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: p.avg,
          humidity: humMap.get(p.ts)?.avg ?? null,
        }));

        setChartData(merged);
      } catch (err) {
        console.error("Erreur graphique:", err);
      }
    }

    fetchClimateData();
  }, [sensors]);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Alerts"
          value={kpis.totalAlerts}
          titleColor="text-blue-600"
          valueColor="text-blue-600"
        />
        <KpiCard
          title="Active sensors"
          value={kpis.activeCount}
          titleColor="text-green-600"
          valueColor="text-green-600"
        />
        <KpiCard
          title="Acked Alerts"
          value={`${kpis.ackedAlerts} / ${kpis.totalAlerts}`}
          titleColor="text-red-600"
          valueColor="text-red-600"
        />
        <KpiCard
          title="Last alert"
          value={kpis.lastAlertTime}
          titleColor="text-purple-600"
          valueColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
          style={{ height: "350px" }}
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Temperature Average
          </h3>
          <div className="h-full w-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="time"
                  minTickGap={50}
                  tick={{ fill: "#64748b" }}
                  axisLine={false}
                />
                <YAxis
                  unit="°C"
                  axisLine={false}
                  tickLine={false}
                  stroke="#34d399"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    color: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#34d399"
                  fillOpacity={0.1}
                  fill="#34d399"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
          style={{ height: "350px" }}
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Humidity Average
          </h3>
          <div className="h-full w-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="time"
                  minTickGap={50}
                  tick={{ fill: "#64748b" }}
                  axisLine={false}
                />
                <YAxis
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                  stroke="#60a5fa"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    color: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#60a5fa"
                  fillOpacity={0.1}
                  fill="#60a5fa"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
