import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/HomePage";
import DevicesPage from "./pages/DevicesPage";
import AlertsPage from "./pages/AlertsPage";
import DeviceDetail from "./pages/DeviceDetails";
import AssetsPage from "./pages/AssetsPage";
import AuthCallbackView from "./components/AuthCallbackView";
import { useSensorData } from "./state/sensorData";
import { useAlerts } from "./state/alert";
import { initSocket } from "./services/socket";
import { ToastContainer, toast } from "react-toastify";
import { useSensor } from "./state/sensor";
import { useAuth } from "./services/useAuth";
import { api } from "./services/api";
import { getAccessToken, getExp, refreshAccessToken } from "./services/oidc";

export default function App() {
  const addSensorValue = useSensorData((state) => state.addSensorValue);
  const push = useAlerts((state) => state.push);
  const sync = useAlerts((state) => state.sync);
  const loadSensors = useSensor((state) => state.loadSensors);
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (location.pathname === "/auth/callback") return;
    if (!isAuthenticated()) {
      login({ redirectTo: "/" });
      return;
    }

    const userAndLoad = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const exp = getExp(token);
          const nowSec = Math.floor(Date.now() / 1000);
          if (exp && nowSec >= exp) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
              login({ redirectTo: window.location.pathname });
              return;
            }
          }
        }

        await api.getMe();
        await loadSensors();
        await sync(() => api.getAlerts());
      } catch (err) {
        console.error(err);
      }
    };
    userAndLoad();

    const socket = initSocket((data) => {
      if (data.is_data === true) {
        if (data.value === undefined || data.value === null) return;
        addSensorValue(data.sensor_id, {
          time: data.time
            ? new Date(data.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "--",
          value: data.value,
          rawTime: data.time,
        });
      }

      if (data.is_alert === true) {
        push(data);
        if (document.visibilityState === "visible") {
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
      }
    });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        toast.dismiss();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket?.disconnect?.();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, login, loadSensors, addSensorValue, push, sync]);

  if (location.pathname === "/auth/callback") {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackView />} />
      </Routes>
    );
  }

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideBar />
      <ToastContainer autoClose={5000} limit={3} />

      <main className="flex-1 min-w-0 p-8 transition-all duration-300">
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackView />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="*" element={<div className="text-slate-400"></div>} />
        </Routes>
      </main>
    </div>
  );
}
