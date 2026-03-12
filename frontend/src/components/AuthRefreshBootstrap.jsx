import { useEffect } from "react";
import { startAutoRefresh } from "../services/oidc";

export default function AuthRefreshBootstrap() {
  useEffect(() => {
    try {
      startAutoRefresh();
    } catch (err) {
      console.error(err);
    }
  }, []);
  return null;
}
