import React from "react";
import KpiCard from "../components/kpiCard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Alerts"
          value="Number alerts"
          color="text-blue-600"
        />
        <KpiCard
          title="Active sensors"
          value="Number sensors"
          titleColor="text-green-600"
        />
        <KpiCard
          title="Acked Alerts"
          value="alerts / total alerts"
          titleColor="text-red-600"
        />
        <KpiCard
          title="Last alert"
          value="time last alert"
          titleColor="text-purple-600"
        />
      </div>
    </div>
  );
}
