import type { BusinessMetricSummary } from "../../shared/types/metric";

interface BusinessMetricsTableProps {
  rows: BusinessMetricSummary[];
}

const names = {
  "outdoor-services": "Pioneer Outdoor Services",
  transport: "Pioneer Transport",
  productions: "Pioneer Productions"
};

function BusinessMetricsTable({ rows }: BusinessMetricsTableProps) {
  return (
    <div className="business-metrics-table-wrapper">
      <table className="business-metrics-table">
        <thead>
          <tr>
            <th>Business</th>
            <th>Revenue</th>
            <th>Expenses</th>
            <th>Jobs</th>
            <th>Estimates</th>
            <th>Conversion</th>
            <th>Customers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.business}>
              <td><strong>{names[row.business]}</strong></td>
              <td>${row.revenue.toLocaleString()}</td>
              <td>${row.expenses.toLocaleString()}</td>
              <td>{row.jobsCompleted}</td>
              <td>{row.estimatesSent}</td>
              <td>{row.conversionRate}%</td>
              <td>{row.customerCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BusinessMetricsTable;
