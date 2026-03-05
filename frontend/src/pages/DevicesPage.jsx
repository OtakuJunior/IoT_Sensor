import React, { useRef, useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSensor } from "../state/sensor";
import { useAlerts } from "../state/alert";
import { useSensorData } from "../state/sensorData";
import KpiCard from "../components/kpiCard";
import { api } from "../services/api";

export default function DevicePage() {
  const sensors = useSensor((state) => state.sensors);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { log } = useAlerts();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sensorStatusFilter, setSensorStatusFilter] = useState("");

  const dataBySensor = useSensorData((state) => state.dataBySensor);
  const setInitialHistory = useSensorData((state) => state.setInitialHistory);

  // 1. useEffect pour les localisations (existant)
  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const response = await api.getLocations();
        if (isMounted) setLocations(response || []);
      } catch (error) {
        console.log(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  const dataBySensorRef = useRef(dataBySensor);
  useEffect(() => {
    dataBySensorRef.current = dataBySensor;
  }, [dataBySensor]);

  useEffect(() => {
    if (sensors.length === 0) return;
    const fetchAllHistories = async () => {
      const sensorsToFetch = sensors.filter(
        (s) => !dataBySensorRef.current[s.id]?.history
      );
      if (sensorsToFetch.length === 0) return;
      await Promise.all(
        sensorsToFetch.map(async (sensor) => {
          try {
            const historyData = await api.getSensorHistory(sensor.id);
            const formatted = historyData.map((point) => ({
              time: point.ts,
              value: point.value,
            }));
            setInitialHistory(sensor.id, formatted);
          } catch (e) {
            console.error(`Error loading history for ${sensor.id}`, e);
          }
        })
      );
    };
    fetchAllHistories();
  }, [sensors, setInitialHistory]);
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

      const matchesDeviceStatus =
        sensorStatusFilter === "" ? true : sensor.status === sensorStatusFilter;

      return matchesSearch && matchesStatus && matchesDeviceStatus;
    });
  }, [sensors, q, statusFilter, activeAlerts, sensorStatusFilter]);

  const summary = useMemo(() => {
    const total = filteredSensors.length;
    const alerting = filteredSensors.filter((s) =>
      activeAlerts.some((a) => a.sensor_id === s.id)
    ).length;
    const ok = total - alerting;

    return { total, ok, alerting };
  }, [filteredSensors, activeAlerts]);

  if (loading) {
    return <div>Loading locations...</div>;
  }

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
              value={sensorStatusFilter}
              onChange={(e) => setSensorStatusFilter(e.target.value)}
            >
              <option value="">All States</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Bypass">Bypass</option>
              <option value="Deregisted">Deregistered</option>
              <option value="Error">Error</option>
            </select>

            <select
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-[10px] px-3 py-2.5 focus:outline-blue-600 focus:border-blue-600 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Alerts</option>
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
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Name
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Location
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Average
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Alert
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Device Status
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSensors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
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
                  const locationObj = locations.find(
                    (loc) => loc.id === sensor.location_id
                  );
                  const locationName = locationObj
                    ? locationObj.name
                    : "Unknown Location";
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
                      <td className="p-3 text-sm font-medium text-slate-800 font-mono">
                        {sensor.name}
                      </td>
                      <td className="p-3 text-sm font-medium text-slate-800">
                        {locationName}
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
                      <td className="p-3 text-sm font-medium text-slate-800">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                          {sensor.status || "Unknown"}
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
