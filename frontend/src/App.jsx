import React from "react";
import { Routes, Route } from "react-router-dom";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/HomePage";
import DevicesPage from "./pages/DevicesPage";
import AlertsPage from "./pages/AlertsPage";
import DeviceDetail from "./pages/DeviceDetails";

function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideBar />

      <main className="flex-1 p-8 transition-all duration-300">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route
            path="*"
            element={
              <div className="text-slate-400">Page en construction 🚧</div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
