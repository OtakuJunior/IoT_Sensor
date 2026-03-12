import { useMemo, useState } from "react";
import {
  getUser,
  hasRole,
  isAuthenticated,
  login,
  logout,
  getAccessToken,
} from "../services/oidc.js";
import { AuthCtx } from "../services/AuthCtx.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const refresh = () => setUser(getUser());
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: () => isAuthenticated(),
      hasRole: (r) => hasRole(r),
      login: (opts) => login(opts),
      logout: () => logout(),
      refresh,
      getAccessToken,
    }),
    [user]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
