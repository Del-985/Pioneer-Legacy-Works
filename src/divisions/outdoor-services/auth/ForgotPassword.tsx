import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import AuthLayout from "./AuthLayout";

function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Reset your password"
      description="Enter your email and we will send instructions when the backend is connected."
      footer={<p>Remember your password? <Link to={ROUTES.divisions.outdoorServices.login}>Return to sign in</Link></p>}
    >
      {submitted ? (
        <div className="outdoor-services-auth-success" role="status">
          <strong>Check your email</strong>
          <p>If an account exists for that address, a password reset link has been sent.</p>
          <Link className="outdoor-services-auth-submit" to={ROUTES.divisions.outdoorServices.resetPassword}>Preview Reset Page</Link>
        </div>
      ) : (
        <form className="outdoor-services-auth-form" onSubmit={handleSubmit}>
          <label className="outdoor-services-auth-field">
            <span>Email address</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <button className="outdoor-services-auth-submit" type="submit">Send Reset Link</button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
