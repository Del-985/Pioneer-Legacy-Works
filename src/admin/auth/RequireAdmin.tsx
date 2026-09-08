import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import {
  getCurrentUser,
  getTemporaryAdminUser,
  logout,
  type AuthUser
} from "../../services/api/auth";
import { getAccessToken } from "../../services/api/client";
import { ROUTES } from "../../shared/constants/routes";

interface RequireAdminProps {
  children: ReactNode;
}

type AccessState =
  | { status: "checking"; user: null }
  | { status: "allowed"; user: AuthUser | null }
  | { status: "denied"; user: AuthUser | null };

const debugBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEBUG_BYPASS === "true";

function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation();
  const [access, setAccess] = useState<AccessState>({ status: "checking", user: null });

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      const temporaryAdmin = getTemporaryAdminUser();
      if (temporaryAdmin) {
        setAccess({ status: "allowed", user: temporaryAdmin });
        return;
      }

      if (debugBypassEnabled) {
        setAccess({ status: "allowed", user: null });
        return;
      }

      if (!getAccessToken()) {
        setAccess({ status: "denied", user: null });
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (!active) return;

        if (user.role === "ADMIN" || user.role === "EMPLOYEE") {
          setAccess({ status: "allowed", user });
        } else {
          logout();
          setAccess({ status: "denied", user });
        }
      } catch {
        logout();
        if (active) setAccess({ status: "denied", user: null });
      }
    }

    void verifyAccess();
    return () => {
      active = false;
    };
  }, []);

  if (access.status === "checking") {
    return (
      <main className="admin-auth-loading" aria-live="polite">
        <div className="admin-auth-loading__card">
          <span className="admin-auth-loading__spinner" aria-hidden="true" />
          <p>Verifying administrative access…</p>
        </div>
      </main>
    );
  }

  if (access.status === "denied") {
    return (
      <Navigate
        replace
        state={{ from: location.pathname, reason: "authentication-required" }}
        to={ROUTES.admin.login}
      />
    );
  }

  return <>{children}</>;
}

export default RequireAdmin;
