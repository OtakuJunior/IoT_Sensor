import React from "react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Tableau de Bord</h1>

      {/* Simulation de cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-gray-500 text-sm font-medium">Active sensors</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">10/10</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-gray-500 text-sm font-medium">Critical alerts</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-gray-500 text-sm font-medium">
            Average Temperature
          </h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">21.5°C</p>
        </div>
      </div>
    </div>
  );
}
