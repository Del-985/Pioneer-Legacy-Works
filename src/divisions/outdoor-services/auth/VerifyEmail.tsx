import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import AuthLayout from "./AuthLayout";

function VerifyEmail() {
  return (
    <AuthLayout
      eyebrow="Verify Email"
      title="Check your inbox"
      description="Your customer account has been prepared in this frontend preview."
      footer={<p>Entered the wrong email? <Link to={ROUTES.divisions.outdoorServices.register}>Register again</Link></p>}
    >
      <div className="outdoor-services-auth-success">
        <strong>Verification email sent</strong>
        <p>
          Follow the link in the email to verify your address. The live system
          will also support resending the verification message.
        </p>
        <button className="outdoor-services-auth-secondary" type="button">Resend Verification Email</button>
        <Link className="outdoor-services-auth-submit" to={ROUTES.divisions.outdoorServices.login}>Continue to Sign In</Link>
      </div>
    </AuthLayout>
  );
}

export default VerifyEmail;
