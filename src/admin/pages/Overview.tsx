import { Link } from "react-router-dom";

import { availableBusinesses } from "../../shared/constants/businesses";
import { adminBusinessRoute } from "../../shared/constants/routes";
import type { BusinessSlug } from "../../shared/types/business";

interface FinancialSnapshot {
  revenue: number | null;
  expenses: number | null;
  estimatedProfit: number | null;
  quotedPipeline: number | null;
}

const emptyFinancialSnapshot: FinancialSnapshot = {
  revenue: null,
  expenses: null,
  estimatedProfit: null,
  quotedPipeline: null
};

const businessFinancials: Record<BusinessSlug, FinancialSnapshot> = {
  landscaping: { ...emptyFinancialSnapshot },
  productions: { ...emptyFinancialSnapshot },
  transport: { ...emptyFinancialSnapshot }
};

function formatCurrency(value: number | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function totalMetric(metric: keyof FinancialSnapshot) {
  const values = availableBusinesses.map(
    (business) => businessFinancials[business.slug][metric]
  );

  if (values.every((value) => value === null)) return null;

  return values.reduce<number>(
    (total, value) => total + (value ?? 0),
    0
  );
}

function Overview() {
  const enterpriseTotals: FinancialSnapshot = {
    revenue: totalMetric("revenue"),
    expenses: totalMetric("expenses"),
    estimatedProfit: totalMetric("estimatedProfit"),
    quotedPipeline: totalMetric("quotedPipeline")
  };

  return (
    <section className="enterprise-financial-overview">
      <header className="enterprise-financial-overview__heading">
        <div>
          <p className="admin-page-heading__eyebrow">Pioneer Legacy Works</p>
          <h2 className="admin-page-heading__title">Financial overview</h2>
          <p className="admin-page-heading__description">
            A quick combined view of the financial position of every Pioneer
            business. Operational details stay inside each business panel.
          </p>
        </div>

        <span className="enterprise-financial-overview__period">Current month</span>
      </header>

      <div className="enterprise-financial-overview__totals">
        <article className="enterprise-financial-metric">
          <span>Revenue</span>
          <strong>{formatCurrency(enterpriseTotals.revenue)}</strong>
          <small>Combined recorded revenue</small>
        </article>

        <article className="enterprise-financial-metric">
          <span>Expenses</span>
          <strong>{formatCurrency(enterpriseTotals.expenses)}</strong>
          <small>Combined recorded expenses</small>
        </article>

        <article className="enterprise-financial-metric">
          <span>Estimated profit</span>
          <strong>{formatCurrency(enterpriseTotals.estimatedProfit)}</strong>
          <small>Revenue less recorded expenses</small>
        </article>

        <article className="enterprise-financial-metric">
          <span>Quoted pipeline</span>
          <strong>{formatCurrency(enterpriseTotals.quotedPipeline)}</strong>
          <small>Open quoted work not yet completed</small>
        </article>
      </div>

      <div className="enterprise-financial-overview__section-heading">
        <div>
          <p>Businesses</p>
          <h3>Financial position by business</h3>
        </div>
        <span>Open a business for operational detail</span>
      </div>

      <div className="enterprise-business-financial-grid">
        {availableBusinesses.map((business) => {
          const snapshot = businessFinancials[business.slug];

          return (
            <article className="enterprise-business-financial-card" key={business.id}>
              <header>
                <div>
                  <p>{business.status === "active" ? "Active" : "Coming soon"}</p>
                  <h4>{business.shortName}</h4>
                </div>
                <Link to={adminBusinessRoute(business.slug)}>Open panel</Link>
              </header>

              <dl>
                <div>
                  <dt>Revenue</dt>
                  <dd>{formatCurrency(snapshot.revenue)}</dd>
                </div>
                <div>
                  <dt>Expenses</dt>
                  <dd>{formatCurrency(snapshot.expenses)}</dd>
                </div>
                <div>
                  <dt>Est. profit</dt>
                  <dd>{formatCurrency(snapshot.estimatedProfit)}</dd>
                </div>
                <div>
                  <dt>Quoted pipeline</dt>
                  <dd>{formatCurrency(snapshot.quotedPipeline)}</dd>
                </div>
              </dl>

              <p className="enterprise-business-financial-card__status">
                Financial data will populate here once business-scoped backend
                records are connected.
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Overview;
