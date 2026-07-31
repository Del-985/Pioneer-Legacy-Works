import {
  calculateEstimateTotals,
  type Estimate,
  type EstimateStatus
} from "../../shared/types/estimate";

interface EstimateDetailProps {
  estimate?: Estimate;
  onStatusChange: (status: EstimateStatus) => void;
  onEdit?: () => void;
  onConvert?: () => void;
  onDocument?: () => void;
  convertedJobNumber?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function EstimateDetail({
  estimate,
  onStatusChange,
  onEdit,
  onConvert,
  onDocument,
  convertedJobNumber
}: EstimateDetailProps) {
  if (!estimate) {
    return (
      <aside className="estimate-detail estimate-detail--empty">
        <h3>Select an estimate</h3>
        <p>Choose an estimate from the list to review its details.</p>
      </aside>
    );
  }

  const totals = calculateEstimateTotals(estimate);

  return (
    <aside className="estimate-detail">
      <div className="estimate-detail__header">
        <div>
          <p className="estimate-detail__number">{estimate.estimateNumber}</p>
          <h2>{estimate.title}</h2>
          <p>{estimate.customerName}</p>
        </div>

        <span className={`estimate-status estimate-status--${estimate.status}`}>
          {estimate.status}
        </span>
      </div>

      <div className="estimate-detail__meta">
        <div>
          <span>Business</span>
          <strong>{estimate.business}</strong>
        </div>
        <div>
          <span>Issued</span>
          <strong>{estimate.issuedDate}</strong>
        </div>
        <div>
          <span>Expires</span>
          <strong>{estimate.expirationDate}</strong>
        </div>
      </div>

      <div className="estimate-detail__items">
        {estimate.lineItems.map((item) => (
          <div className="estimate-detail__item" key={item.id}>
            <div>
              <strong>{item.description}</strong>
              <span>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </span>
            </div>
            <strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
          </div>
        ))}
      </div>

      <dl className="estimate-detail__totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatCurrency(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>Discount</dt>
          <dd>-{formatCurrency(totals.discountAmount)}</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>{formatCurrency(totals.taxAmount)}</dd>
        </div>
        <div className="estimate-detail__total">
          <dt>Total</dt>
          <dd>{formatCurrency(totals.total)}</dd>
        </div>
      </dl>

      {estimate.notes ? (
        <div className="estimate-detail__notes">
          <span>Notes</span>
          <p>{estimate.notes}</p>
        </div>
      ) : null}

      <div className="estimate-detail__actions">
        {onEdit ? <button type="button" onClick={onEdit}>Edit</button> : null}
        {onDocument ? <button type="button" onClick={onDocument}>Download</button> : null}
        {estimate.status === "draft" ? <button type="button" onClick={() => onStatusChange("sent")}>
          Mark Sent
        </button> : null}
        {["draft", "sent"].includes(estimate.status) ? <button
          className="estimate-detail__action--primary"
          type="button"
          onClick={() => onStatusChange("approved")}
        >
          Approve
        </button> : null}
        {onConvert ? <button className="estimate-detail__action--primary" type="button" onClick={onConvert}>Create Job</button> : null}
      </div>
      {convertedJobNumber ? <p className="estimate-detail__job-link">Converted to {convertedJobNumber}</p> : null}
    </aside>
  );
}

export default EstimateDetail;
