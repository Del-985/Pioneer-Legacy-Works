import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setComplete(true);
  };

  return (
    <AuthLayout
      eyebrow="Choose Password"
      title="Create a new password"
      description="Use a strong password you have not used for this account before."
      footer={<p><Link to={ROUTES.divisions.outdoorServices.login}>Return to sign in</Link></p>}
    >
      {complete ? (
        <div className="outdoor-services-auth-success" role="status">
          <strong>Password updated</strong>
          <p>Your password has been changed in this frontend preview.</p>
          <Link className="outdoor-services-auth-submit" to={ROUTES.divisions.outdoorServices.login}>Continue to Sign In</Link>
        </div>
      ) : (
        <form className="outdoor-services-auth-form" onSubmit={handleSubmit}>
          <PasswordField label="New password" name="password" autoComplete="new-password" value={password} onChange={setPassword} />
          <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} />
          {error ? <p className="outdoor-services-auth-error" role="alert">{error}</p> : null}
          <button className="outdoor-services-auth-submit" type="submit">Update Password</button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPassword;
