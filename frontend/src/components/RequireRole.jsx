import { useAuth } from "../../services/useAuth.js";

export default function RequireRole({ role, children, fallback = null }) {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated()) return fallback;
  if (role && !hasRole(role)) return fallback;
  return children;
}
