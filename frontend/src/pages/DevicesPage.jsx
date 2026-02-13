import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/sensors");
        const data = await response.json();

        setDevices(data);
        setLoading(false);
      } catch (error) {
        console.error("Connection error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

      {loading && (
        <p className="text-blue-500 animate-pulse">Loading data...</p>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Devices</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {devices.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
            <h3 className="text-gray-500 text-sm font-medium mb-4">
              Network status
            </h3>
            <div className="space-y-3">
              {devices.map((device) => (
                <Link to={`/devices/${device.id}`} key={device.id}>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">
                      {device.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm">
                        {device.value}
                      </span>

                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          device.status === "online"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {device.status ? device.status.toUpperCase() : "N/A"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
