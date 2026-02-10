import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/alerts/");
        const data = await response.json();

        setAlerts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          🚨 Alerts History
        </h1>
        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {alerts.filter((a) => !a.is_resolved).length} Unresolved
        </span>
      </div>

      {loading && (
        <p className="text-slate-500 animate-pulse">Loading alerts...</p>
      )}

      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Sensor</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-slate-600 whitespace-nowrap">
                    {formatDate(alert.time)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        alert.severity === "Critical"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-xs text-slate-500">
                    {alert.sensor_id}
                  </td>

                  <td className="p-4 text-slate-700">
                    <div className="font-medium text-xs">
                      {alert.message || "No message"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Direction:{" "}
                      <span className="font-semibold">{alert.direction}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    {alert.is_resolved ? (
                      <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1 text-sm font-medium animate-pulse">
                        ● Active
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/devices/${alert.sensor_id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
                    >
                      View Device
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && alerts.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No alerts found in the database. Good job! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
}
