import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      navigate(ROUTES.divisions.outdoorServices.account);
    }, 500);
  };

  return (
    <AuthLayout
      eyebrow="Sign In"
      title="Customer Login"
      description="Use the email connected to your Pioneer customer account."
      footer={<p>New to Pioneer? <Link to={ROUTES.divisions.outdoorServices.register}>Create an account</Link></p>}
    >
      <form className="outdoor-services-auth-form" onSubmit={handleSubmit}>
        <label className="outdoor-services-auth-field">
          <span>Email address</span>
          <input autoComplete="email" name="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <PasswordField label="Password" name="password" autoComplete="current-password" value={password} onChange={setPassword} />

        <div className="outdoor-services-auth-form__row">
          <label className="outdoor-services-auth-check">
            <input name="remember" type="checkbox" />
            <span>Remember me</span>
          </label>
          <Link to={ROUTES.divisions.outdoorServices.forgotPassword}>Forgot password?</Link>
        </div>

        <button className="outdoor-services-auth-submit" disabled={submitting} type="submit">
          {submitting ? "Signing In…" : "Sign In"}
        </button>
        <p className="outdoor-services-auth-note">Frontend preview: any valid email and password will open the mock customer dashboard.</p>
      </form>
    </AuthLayout>
  );
}

export default Login;
