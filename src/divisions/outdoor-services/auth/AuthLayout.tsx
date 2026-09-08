import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer
}: AuthLayoutProps) {
  return (
    <section className="outdoor-services-auth-page">
      <div className="container outdoor-services-auth-page__layout">
        <aside className="outdoor-services-auth-intro">
          <Link className="outdoor-services-auth-intro__brand" to={ROUTES.divisions.outdoorServices.root}>
            <span aria-hidden="true">P</span>
            <strong>Pioneer Outdoor Services</strong>
          </Link>
          <p className="outdoor-services-eyebrow">Customer Portal</p>
          <h1>Manage your property services in one place.</h1>
          <p>
            Track requests, review estimates, confirm appointments, view service
            history, and manage future billing from your customer account.
          </p>
          <ul>
            <li>Review estimates and active requests</li>
            <li>See upcoming and completed services</li>
            <li>Keep contact and property information current</li>
          </ul>
        </aside>

        <div className="outdoor-services-auth-card">
          <header className="outdoor-services-auth-card__header">
            <p>{eyebrow}</p>
            <h2>{title}</h2>
            <span>{description}</span>
          </header>
          {children}
          {footer ? <footer className="outdoor-services-auth-card__footer">{footer}</footer> : null}
        </div>
      </div>
    </section>
  );
}

export default AuthLayout;
