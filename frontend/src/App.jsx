import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/HomePage";
import DevicesPage from "./pages/DevicesPage";
import AlertsPage from "./pages/AlertsPage";
import DeviceDetail from "./pages/DeviceDetails";
import { useSensorData } from "./state/sensorData";
import { useAlerts } from "./state/alert";
import { initSocket } from "./services/socket";
import { ToastContainer, toast } from "react-toastify";
import { useSensor } from "./state/sensor";

export default function App() {
  const addSensorValue = useSensorData((state) => state.addSensorValue);
  const push = useAlerts((state) => state.push);
  const loadSensors = useSensor((state) => state.loadSensors);

  useEffect(() => {
    loadSensors();
    const socket = initSocket((data) => {
      if (data.is_data === true) {
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
      }
      if (data.is_alert === true) {
        push(data);
        const toast_severity = {
          Critical: toast.error,
          Warning: toast.warning,
        };
        const alert_notif =
          toast_severity[data.severity] || (() => toast.info("Alert Error"));
        const [title, detail] = data.message.split(",");
        alert_notif(
          <div>
            <div className="font-bold">{title}</div>
            {detail && <div className="text-sm mt-1">{detail.trim()}</div>}
          </div>
        );
      }
    });
    return () => socket?.disconnect?.();
  }, [loadSensors, addSensorValue, push]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideBar />
      <ToastContainer autoClose={10000} limit={3} />

      <main className="flex-1 min-w-0 p-8 transition-all duration-300">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="*" element={<div className="text-slate-400"></div>} />
        </Routes>
      </main>
    </div>
  );
}
