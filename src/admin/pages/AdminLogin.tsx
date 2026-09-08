import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { login, logout } from "../../services/api/auth";
import { getAccessToken } from "../../services/api/client";
import { ROUTES } from "../../shared/constants/routes";

interface LoginLocationState {
  from?: string;
  reason?: string;
}

const debugBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEBUG_BYPASS === "true";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const destination = state?.from?.startsWith("/admin")
    ? state.from
    : ROUTES.admin.overview;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (getAccessToken() && !debugBypassEnabled) {
    return <Navigate replace to={ROUTES.admin.overview} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
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
            <p>Staff Portal</p>
            <h2>Sign in to Admin</h2>
            <span>Use an administrator or employee account.</span>
          </header>

          {state?.reason === "authentication-required" ? (
            <p className="admin-login-card__notice" role="status">
              Sign in is required to open that administrative page.
            </p>
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
                autoComplete="current-password"
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

          {error ? <p className="admin-login-card__error" role="alert">{error}</p> : null}

          <button
            className="admin-login-card__submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>

          {debugBypassEnabled ? (
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
