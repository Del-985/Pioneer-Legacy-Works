import { useMemo, useState } from "react";

import BusinessMetricsTable from "../components/BusinessMetricsTable";
import MetricCard from "../components/MetricCard";
import MetricFilters from "../components/MetricFilters";
import MetricTrendChart from "../components/MetricTrendChart";
import type { BusinessSlug } from "../../shared/types/business";
import type {
  BusinessMetricSummary,
  MetricPeriod,
  MetricTrendPoint,
  MetricValue
} from "../../shared/types/metric";

const businessRows: BusinessMetricSummary[] = [
  { business: "outdoor-services", revenue: 12840, expenses: 4380, jobsCompleted: 34, estimatesSent: 41, conversionRate: 63, customerCount: 28 },
  { business: "transport", revenue: 6200, expenses: 2710, jobsCompleted: 15, estimatesSent: 19, conversionRate: 58, customerCount: 12 },
  { business: "productions", revenue: 4100, expenses: 1650, jobsCompleted: 8, estimatesSent: 13, conversionRate: 46, customerCount: 9 }
];

const revenueTrend: MetricTrendPoint[] = [
  { label: "Feb", value: 9800 },
  { label: "Mar", value: 12400 },
  { label: "Apr", value: 13750 },
  { label: "May", value: 16500 },
  { label: "Jun", value: 18800 },
  { label: "Jul", value: 23140 }
];

function Metrics() {
  const [business, setBusiness] = useState<BusinessSlug | "all">("all");
  const [period, setPeriod] = useState<MetricPeriod>("30d");

  const visibleRows = useMemo(
    () => business === "all" ? businessRows : businessRows.filter((row) => row.business === business),
    [business]
  );

  const totals = useMemo(() => visibleRows.reduce(
    (summary, row) => ({
      revenue: summary.revenue + row.revenue,
      expenses: summary.expenses + row.expenses,
      jobs: summary.jobs + row.jobsCompleted,
      estimates: summary.estimates + row.estimatesSent,
      customers: summary.customers + row.customerCount
    }),
    { revenue: 0, expenses: 0, jobs: 0, estimates: 0, customers: 0 }
  ), [visibleRows]);

  const conversion = totals.estimates ? Math.round((totals.jobs / totals.estimates) * 100) : 0;
  const profit = totals.revenue - totals.expenses;

  const cards: MetricValue[] = [
    { id: "revenue", label: "Revenue", value: totals.revenue, formattedValue: `$${totals.revenue.toLocaleString()}`, change: 18.4, trend: "up", description: "Gross revenue for the selected period" },
    { id: "profit", label: "Operating Margin", value: profit, formattedValue: `$${profit.toLocaleString()}`, change: 12.1, trend: "up", description: "Revenue remaining after recorded expenses" },
    { id: "jobs", label: "Completed Jobs", value: totals.jobs, formattedValue: totals.jobs.toLocaleString(), change: 8.6, trend: "up", description: "Completed work across selected businesses" },
    { id: "conversion", label: "Estimate Conversion", value: conversion, formattedValue: `${conversion}%`, change: -2.3, trend: "down", description: "Completed jobs compared with estimates sent" },
    { id: "customers", label: "Active Customers", value: totals.customers, formattedValue: totals.customers.toLocaleString(), change: 5.2, trend: "up", description: "Customers with current or recent activity" }
  ];

  return (
    <section className="admin-metrics-page">
      <div className="admin-page-heading metrics-page__heading">
        <div>
          <p className="admin-page-heading__eyebrow">Reporting</p>
          <h2 className="admin-page-heading__title">Business Metrics</h2>
          <p className="admin-page-heading__description">
            Review revenue, expenses, job volume, estimate conversion, and customer growth across Pioneer Enterprises.
          </p>
        </div>
        <button className="metrics-page__export" type="button">Export Report</button>
      </div>

      <MetricFilters business={business} period={period} onBusinessChange={setBusiness} onPeriodChange={setPeriod} />

      <div className="metrics-summary-grid">
        {cards.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </div>

      <div className="metrics-page__content-grid">
        <MetricTrendChart
          title="Revenue Performance"
          description={`Monthly revenue trend. Current filter: ${period.toUpperCase()}.`}
          points={revenueTrend}
          valuePrefix="$"
        />

        <section className="metrics-health-panel">
          <p className="metrics-health-panel__eyebrow">Financial Health</p>
          <h3>Revenue Allocation</h3>
          <div className="metrics-health-panel__figures">
            <div><span>Revenue</span><strong>${totals.revenue.toLocaleString()}</strong></div>
            <div><span>Expenses</span><strong>${totals.expenses.toLocaleString()}</strong></div>
            <div><span>Net</span><strong>${profit.toLocaleString()}</strong></div>
          </div>
          <div className="metrics-health-panel__track">
            <span style={{ width: `${totals.revenue ? Math.min((totals.expenses / totals.revenue) * 100, 100) : 0}%` }} />
          </div>
          <p className="metrics-health-panel__note">Recorded expenses represent {totals.revenue ? Math.round((totals.expenses / totals.revenue) * 100) : 0}% of revenue.</p>
        </section>
      </div>

      <section className="metrics-business-panel">
        <div className="metrics-business-panel__header">
          <div>
            <p>Portfolio</p>
            <h3>Business Performance</h3>
          </div>
          <span>{visibleRows.length} {visibleRows.length === 1 ? "business" : "businesses"}</span>
        </div>
        <BusinessMetricsTable rows={visibleRows} />
      </section>
    </section>
  );
}

export default Metrics;
