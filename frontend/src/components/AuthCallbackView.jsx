import { useState, useEffect, useRef } from "react";
import { handleCallback } from "../services/oidc";
import { useAuth } from "../services/useAuth.js";

export default function AuthCallbackView() {
  const [err, setErr] = useState("");
  const { refresh } = useAuth();
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    (async () => {
      try {
        const res = await handleCallback(window.location.href);
        refresh();
        window.location.replace(res.redirectTo || "/");
      } catch (e) {
        console.error("handleCallback error:", e);
        setErr(String(e.message || e));
      }
    })();
  }, [refresh]);
  return (
    <div className="panel">
      <div className="panel-title">Authentification…</div>
      {err ? (
        <div
          className="badge"
          style={{ color: "#ef4444", borderColor: "#ef4444" }}
        >
          {err}
        </div>
      ) : (
        <div>Veuillez patienter…</div>
      )}
    </div>
  );
}
