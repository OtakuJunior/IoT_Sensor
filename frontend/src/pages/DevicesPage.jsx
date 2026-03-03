import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSensor } from "../state/sensor";
import { useAlerts } from "../state/alert";
import { useSensorData } from "../state/sensorData";
import KpiCard from "../components/kpiCard";

export default function DevicePage() {
  const sensors = useSensor((state) => state.sensors);
  const { log } = useAlerts();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const dataBySensor = useSensorData((state) => state.dataBySensor);

  const activeAlerts = useMemo(() => {
    return (log || []).filter((alert) => !alert.is_resolved);
  }, [log]);

  const filteredSensors = useMemo(() => {
    return (sensors || []).filter((sensor) => {
      const matchesSearch =
        sensor.name?.toLowerCase().includes(q.toLowerCase()) ||
        sensor.id?.toLowerCase().includes(q.toLowerCase());

      const isAlerting = activeAlerts.some((a) => a.sensor_id === sensor.id);

      const matchesStatus =
        statusFilter === "Alert"
          ? isAlerting
          : statusFilter === "OK"
          ? !isAlerting
          : true;

      return matchesSearch && matchesStatus;
    });
  }, [sensors, q, statusFilter, activeAlerts]);

  const summary = useMemo(() => {
    const total = filteredSensors.length;
    const alerting = filteredSensors.filter((s) =>
      activeAlerts.some((a) => a.sensor_id === s.id)
    ).length;
    const ok = total - alerting;

    return { total, ok, alerting };
  }, [filteredSensors, activeAlerts]);

  return (
    <div className="space-y-6 min-w-0 w-full overflow-hidden">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Devices List</h2>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-[10px] px-3 py-2.5 focus:outline-blue-600 focus:border-blue-600 w-full md:w-64 transition-shadow"
              placeholder="Search by name or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-[10px] px-3 py-2.5 focus:outline-blue-600 focus:border-blue-600 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OK">OK</option>
              <option value="Alert">In Alert</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KpiCard title="Total Devices" value={summary.total} />
        <KpiCard
          title="Normal Status"
          value={summary.ok}
          titleColor="text-green-600"
          valueColor="text-green-600"
        />
        <KpiCard
          title="In Alert"
          value={summary.alerting}
          titleColor="text-red-600"
          valueColor="text-red-600"
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-4">All Devices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-sm font-semibold text-slate-500">ID</th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Name
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Average
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Status
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSensors.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-slate-400 italic text-sm pt-3"
                  >
                    No devices found.
                  </td>
                </tr>
              ) : (
                filteredSensors.map((sensor) => {
                  const isAlerting = activeAlerts.some(
                    (a) => a.sensor_id === sensor.id
                  );
                  const history = dataBySensor[sensor.id]?.history;
                  let average = "--";
                  if (history && history.length > 0) {
                    const values = history.map((item) => item.value);
                    const avg =
                      values.reduce((acc, curr) => acc + curr, 0) /
                      values.length;
                    average = Number(avg.toFixed(2));
                  }

                  return (
                    <tr
                      key={sensor.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-3 text-sm text-slate-500 font-mono">
                        {sensor.id}
                      </td>
                      <td className="p-3 text-sm font-medium text-slate-800">
                        {sensor.name}
                      </td>
                      <td className="p-3 text-sm text-slate-500">
                        {average !== "--"
                          ? `${average.toFixed(2)} ${sensor.unit || ""}`
                          : "--"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            isAlerting
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-green-50 text-green-600 border-green-200"
                          }`}
                        >
                          {isAlerting ? "Alert" : "OK"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/device/${sensor.id}`}
                          className="inline-block bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
