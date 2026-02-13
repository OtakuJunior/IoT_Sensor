import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/HomePage";
import DevicesPage from "./pages/DevicesPage";
import AlertsPage from "./pages/AlertsPage";
import DeviceDetail from "./pages/DeviceDetails";
import { useSensorData } from "./state/sensorData";
import { initSocket } from "./services/socket";

function App() {
  const addSensorValue = useSensorData((state) => state.addSensorValue);

  useEffect(() => {
    initSocket((data) => {
      if (data.value === undefined || data.value === null) {
        return;
      }

      addSensorValue(data.sensor_id, {
        time: new Date(data.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        value: data.value,
        rawTime: data.time,
      });
      console.log(data.value);
    });
  }, [addSensorValue]);

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
