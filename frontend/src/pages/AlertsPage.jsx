import React, { useState, useMemo, useEffect } from "react";
import { useAlerts } from "../state/alert";
import { useSensor } from "../state/sensor";
import { getSensorInfos } from "../lib/sensorInfos";
import KpiCard from "../components/kpiCard";
import { useAuth } from "../services/useAuth";

const windowLabels = {
  0: "All time",
  15: "15 min",
  60: "1 hour",
  360: "6 hours",
  1440: "24 hours",
  10080: "1 week",
};

const PAGE_SIZE = 20;

export default function AlertsLog() {
  const { user } = useAuth();

  const sensors = useSensor((state) => state.sensors);
  const { log, acked, audit, ack } = useAlerts();

  const [q, setQ] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [windowMin, setWindowMin] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [page, setPage] = useState(1);

  const ackedSet = useMemo(() => new Set(acked), [acked]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return log.filter((item) => {
      const matchesSearch =
        item.sensor_id?.toLowerCase().includes(q.toLowerCase()) ||
        item.message?.toLowerCase().includes(q.toLowerCase());
      const matchesSeverity = severityFilter
        ? item.severity === severityFilter
        : true;
      const itemTime = new Date(item.time || item.timestamp).getTime();
      const matchesTime =
        windowMin === 0 ? true : now - itemTime < windowMin * 60 * 1000;
      return matchesSearch && matchesSeverity && matchesTime;
    });
  }, [log, q, severityFilter, windowMin, now]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = {
    total: filtered.length,
    unacked: filtered.filter((i) => !ackedSet.has(i.id)).length,
    latest:
      filtered.length > 0
        ? new Date(
            filtered[0].time || filtered[0].timestamp
          ).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
  };

  const exportCSV = () => {
    try {
      const header = [
        "Time",
        "ID",
        "Sensor",
        "Value",
        "Severity",
        "Message",
        "Acked",
      ];
      const lines = [header.join(",")];
      filtered.forEach((a) => {
        lines.push(
          [
            new Date(a.time || a.timestamp).toISOString(),
            a.id,
            a.sensor_id,
            a.value,
            a.severity,
            `"${a.message}"`,
            ackedSet.has(a.id) ? "Yes" : "No",
          ].join(",")
        );
      });
      const blob = new Blob([lines.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url;
      el.download = "alerts_export.csv";
      el.click();
    } catch (e) {
      console.error(e);
    }
  };

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ logs: filtered, audit }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "alerts_export.json";
    el.click();
  };

  return (
    <div className="space-y-6 min-w-0 w-full overflow-hidden">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800">Alerts Log</h2>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-[10px] px-3 py-2.5 focus:outline-blue-600 focus:border-blue-600 w-full md:w-64 transition-shadow"
              placeholder="Filter device/metric..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-[10px] px-3 py-2.5 focus:outline-blue-600 focus:border-blue-600 cursor-pointer"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Levels</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
            </select>
            <select
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-[10px] px-3 py-2.5 focus:outline-blue-600 focus:border-blue-600 cursor-pointer"
              value={windowMin}
              onChange={(e) => {
                setWindowMin(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={0}>Window: All</option>
              <option value={15}>15 min</option>
              <option value={60}>1 hour</option>
              <option value={360}>6 hours</option>
              <option value={1440}>24 hours</option>
              <option value={10080}>1 week</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-50">
          <div className="grow"></div>
          <button
            onClick={exportCSV}
            className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total Alerts" value={summary.total} />
        <KpiCard
          title="No Ack"
          value={summary.unacked}
          titleColor="text-orange-600"
          valueColor="text-orange-600"
        />
        <KpiCard title="Latest Alert" value={summary.latest} />
        <KpiCard
          title="Window"
          value={windowLabels[windowMin] || `${windowMin} min`}
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        {/* Header + info page */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">All Alerts</h3>
          <span className="text-xs text-slate-400">
            {filtered.length === 0
              ? "No results"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Time
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Device
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Message
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Level
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500 text-center">
                  Ack
                </th>
                <th className="p-3 text-sm font-semibold text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-slate-400 italic text-sm pt-3"
                  >
                    No alerts found.
                  </td>
                </tr>
              ) : (
                paginated.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
                      {a.time
                        ? new Date(a.time).toLocaleString()
                        : new Date(a.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm font-medium text-slate-800">
                      {getSensorInfos(sensors, a.sensor_id)?.name}
                    </td>
                    <td
                      className="p-3 text-sm text-slate-500"
                      title={a.message}
                    >
                      {a.message}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          a.severity === "Critical"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {ackedSet.has(a.id) && (
                        <span className="text-green-500 font-bold text-lg">
                          ✓
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          ack(
                            a.id,
                            user?.name || user?.preferred_username || "Operator"
                          )
                        }
                        disabled={ackedSet.has(a.id)}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors border ${
                          ackedSet.has(a.id)
                            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {ackedSet.has(a.id) ? "Acked" : "Ack"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>

            {(() => {
              const delta = 2;
              const total = 5;
              let start = Math.max(1, page - delta);
              let end = start + total - 1;
              if (end > totalPages) {
                end = totalPages;
                start = Math.max(1, end - total + 1);
              }
              return Array.from(
                { length: end - start + 1 },
                (_, i) => start + i
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    p === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ));
            })()}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Audit Trail</h3>
        <div className="space-y-0 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {(!audit || audit.length === 0) && (
            <p className="text-sm text-slate-400 italic">No audit entries.</p>
          )}
          {audit.map((e, idx) => (
            <div
              key={idx}
              className="flex flex-wrap justify-between items-center text-xs py-2 hover:bg-slate-50 px-2 rounded"
            >
              <span className="font-mono text-slate-500 w-32">
                {new Date(e.ts).toLocaleTimeString()}
              </span>
              <span className="text-blue-600 font-bold uppercase w-16">
                {e.action}
              </span>
              <span className="text-slate-600 flex-1 truncate px-2">
                {e.id ? `ID: ${e.id.slice(0, 8)}...` : "System"}
              </span>
              <span className="text-slate-400">{e.user || "Unknown"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
