import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import {
  bootstrapAdmin,
  getAdminBootstrapStatus,
  login,
  logout,
  type AdminBootstrapStatus
} from "../../services/api/auth";
import { getAccessToken } from "../../services/api/client";
import { ROUTES } from "../../shared/constants/routes";

interface LoginLocationState {
  from?: string;
  reason?: string;
}

type AdminLoginMode = "login" | "bootstrap";

const debugBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEBUG_BYPASS === "true";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const destination = state?.from?.startsWith("/admin")
    ? state.from
    : ROUTES.admin.overview;

  const [mode, setMode] = useState<AdminLoginMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [bootstrapStatus, setBootstrapStatus] =
    useState<AdminBootstrapStatus | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getAdminBootstrapStatus()
      .then((status) => {
        if (mounted) setBootstrapStatus(status);
      })
      .catch(() => {
        // Login remains usable if the bootstrap endpoint is disabled or unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (getAccessToken() && !debugBypassEnabled) {
    return <Navigate replace to={ROUTES.admin.overview} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "bootstrap") {
        const result = await bootstrapAdmin(
          { firstName, lastName, email, password },
          bootstrapSecret.trim() || undefined
        );

        if (result.user.role !== "ADMIN") {
          logout();
          setError("The bootstrap account was not created with administrator access.");
          return;
        }

        setBootstrapStatus((current) =>
          current
            ? { ...current, available: false, adminExists: true }
            : current
        );
        navigate(destination, { replace: true });
        return;
      }

      const result = await login({ email, password });

      if (result.user.role !== "ADMIN" && result.user.role !== "EMPLOYEE") {
        logout();
        setError("This account does not have administrative access.");
        return;
      }

      navigate(destination, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bootstrapMode = mode === "bootstrap";

  return (
    <main className="admin-login-page">
      <section className="admin-login-shell">
        <aside className="admin-login-branding">
          <Link to={ROUTES.website.home} className="admin-login-branding__mark">
            P
          </Link>
          <p className="admin-login-branding__eyebrow">Pioneer Legacy Works</p>
          <h1>Administrative access.</h1>
          <p>
            Sign in to manage customers, estimates, jobs, expenses, forms,
            notifications, and business settings.
          </p>
          <ul>
            <li>Role-protected administration</li>
            <li>Secure token-based sessions</li>
            <li>Access validated against the Pioneer API</li>
          </ul>
        </aside>

        <form className="admin-login-card" onSubmit={handleSubmit}>
          <header>
            <p>{bootstrapMode ? "One-time Setup" : "Staff Portal"}</p>
            <h2>{bootstrapMode ? "Create first administrator" : "Sign in to Admin"}</h2>
            <span>
              {bootstrapMode
                ? "This setup option closes automatically after the first administrator is created."
                : "Use an administrator or employee account."}
            </span>
          </header>

          {state?.reason === "authentication-required" && !bootstrapMode ? (
            <p className="admin-login-card__notice" role="status">
              Sign in is required to open that administrative page.
            </p>
          ) : null}

          {bootstrapStatus?.enabled && !bootstrapStatus.configured ? (
            <p className="admin-login-card__notice" role="status">
              First-administrator setup is enabled on the API, but production
              setup requires an ADMIN_BOOTSTRAP_SECRET.
            </p>
          ) : null}

          {bootstrapMode ? (
            <div className="admin-login-card__name-grid">
              <label>
                <span>First name</span>
                <input
                  autoComplete="given-name"
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  type="text"
                  value={firstName}
                />
              </label>

              <label>
                <span>Last name</span>
                <input
                  autoComplete="family-name"
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  type="text"
                  value={lastName}
                />
              </label>
            </div>
          ) : null}

          <label>
            <span>Email address</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>Password</span>
            <div className="admin-login-card__password">
              <input
                autoComplete={bootstrapMode ? "new-password" : "current-password"}
                minLength={bootstrapMode ? 8 : undefined}
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button type="button" onClick={() => setShowPassword((shown) => !shown)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {bootstrapMode && bootstrapStatus?.requiresSecret ? (
            <label>
              <span>Bootstrap secret</span>
              <input
                autoComplete="off"
                onChange={(event) => setBootstrapSecret(event.target.value)}
                required
                type="password"
                value={bootstrapSecret}
              />
            </label>
          ) : null}

          {error ? <p className="admin-login-card__error" role="alert">{error}</p> : null}

          <button
            className="admin-login-card__submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? bootstrapMode
                ? "Creating administrator…"
                : "Signing in…"
              : bootstrapMode
                ? "Create Administrator"
                : "Sign In"}
          </button>

          {bootstrapStatus?.available ? (
            <button
              className="admin-login-card__bootstrap-toggle"
              type="button"
              onClick={() => {
                setMode((current) => current === "login" ? "bootstrap" : "login");
                setError("");
                setShowPassword(false);
              }}
            >
              {bootstrapMode ? "Back to staff sign in" : "Create the first administrator"}
            </button>
          ) : null}

          {debugBypassEnabled && !bootstrapMode ? (
            <button
              className="admin-login-card__debug"
              onClick={() => navigate(destination, { replace: true })}
              type="button"
            >
              Enter with development bypass
            </button>
          ) : null}

          <footer>
            <Link to={ROUTES.website.home}>Return to website</Link>
          </footer>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
