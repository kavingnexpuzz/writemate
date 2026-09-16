export const STATUS_META = {
  PENDING: { label: 'Pending', color: 'default' },
  MATCHED: { label: 'Matched', color: 'info' },
  QUOTATION_SENT: { label: 'Quotation sent', color: 'info' },
  QUOTATION_ACCEPTED: { label: 'Quotation accepted', color: 'primary' },
  PAYMENT_PENDING: { label: 'Payment pending', color: 'warning' },
  PAID: { label: 'Paid', color: 'success' },
  IN_PROGRESS: { label: 'In progress', color: 'primary' },
  COMPLETED: { label: 'Completed', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'error' },
  DISPUTED: { label: 'Disputed', color: 'error' },
};

export function statusMeta(status) {
  return STATUS_META[status] || { label: status, color: 'default' };
}

export default STATUS_META;
