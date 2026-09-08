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
    <section className="landscaping-auth-page">
      <div className="container landscaping-auth-page__layout">
        <aside className="landscaping-auth-intro">
          <Link className="landscaping-auth-intro__brand" to={ROUTES.divisions.landscaping.root}>
            <span aria-hidden="true">P</span>
            <strong>Pioneer Outdoor Services</strong>
          </Link>
          <p className="landscaping-eyebrow">Customer Portal</p>
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

        <div className="landscaping-auth-card">
          <header className="landscaping-auth-card__header">
            <p>{eyebrow}</p>
            <h2>{title}</h2>
            <span>{description}</span>
          </header>
          {children}
          {footer ? <footer className="landscaping-auth-card__footer">{footer}</footer> : null}
        </div>
      </div>
    </section>
  );
}

export default AuthLayout;
