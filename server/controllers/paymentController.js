const Payment = require('../models/Payment');
const Request = require('../models/Request');
const Quotation = require('../models/Quotation');
const WriterProfile = require('../models/WriterProfile');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { assertRequired } = require('../utils/validation');
const { ROLES, REQUEST_STATUS, PAYMENT_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

function paginationParams(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * The writer's UPI QR/ID is only ever shown to the customer once a
 * quotation has been accepted for their own request — never before, and
 * never to anyone else.
 */
const getPaymentInfo = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.requestId).populate('acceptedQuotation');
  if (!request) throw new ApiError(404, 'Request not found');
  if (!request.customer.equals(req.user._id)) {
    throw new ApiError(403, 'Only the request owner can view payment details');
  }
  if (!request.acceptedQuotation) {
    throw new ApiError(400, 'No accepted quotation yet — payment details are not available');
  }

  const writerProfile = await WriterProfile.findOne({ user: request.writer }).select('upiId upiQrCodeUrl');
  if (!writerProfile) throw new ApiError(404, 'Writer profile not found');

  const existingPayment = await Payment.findOne({ request: request._id });

  res.json({
    success: true,
    message: 'OK',
    data: {
      upiId: writerProfile.upiId,
      upiQrCodeUrl: writerProfile.upiQrCodeUrl,
      amount: request.acceptedQuotation.estimatedTotal,
      existingPayment,
    },
  });
});

/**
 * Customer records that they've paid via UPI and provides the transaction
 * ID. This does NOT verify the payment — it puts it in
 * PENDING_VERIFICATION until the writer or an admin confirms it (see
 * verifyPayment). Resubmission is allowed if a prior attempt was rejected.
 */
const createPayment = asyncHandler(async (req, res) => {
  const { requestId, transactionId } = req.body;
  assertRequired(['requestId', 'transactionId'], req.body);

  const request = await Request.findById(requestId).populate('acceptedQuotation');
  if (!request) throw new ApiError(404, 'Request not found');
  if (!request.customer.equals(req.user._id)) {
    throw new ApiError(403, 'Only the request owner can submit payment');
  }
  if (!request.acceptedQuotation) {
    throw new ApiError(400, 'No accepted quotation to pay for');
  }
  if (![REQUEST_STATUS.PAYMENT_PENDING].includes(request.status)) {
    throw new ApiError(400, 'This request is not awaiting payment');
  }

  let payment = await Payment.findOne({ request: request._id });

  if (payment && payment.status === PAYMENT_STATUS.VERIFIED) {
    throw new ApiError(409, 'This request has already been paid for');
  }
  if (payment && payment.status === PAYMENT_STATUS.PENDING_VERIFICATION) {
    throw new ApiError(409, 'A payment for this request is already awaiting verification');
  }

  if (payment) {
    // Previous attempt was rejected — let the customer resubmit on the same record.
    payment.transactionId = transactionId;
    payment.status = PAYMENT_STATUS.PENDING_VERIFICATION;
    payment.rejectionReason = '';
    await payment.save();
  } else {
    payment = await Payment.create({
      request: request._id,
      customer: request.customer,
      writer: request.writer,
      amount: request.acceptedQuotation.estimatedTotal,
      transactionId,
      paymentMethod: 'UPI',
      status: PAYMENT_STATUS.PENDING_VERIFICATION,
    });
  }

  await Notification.create({
    recipient: request.writer,
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title: 'Payment submitted — please verify',
    message: `A payment of ₹${payment.amount} was submitted for "${request.title}". Verify the transaction ID before starting work.`,
    relatedRequest: request._id,
  });

  res.status(201).json({ success: true, message: 'Payment submitted for verification', data: { payment } });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('request', 'title status');
  if (!payment) throw new ApiError(404, 'Payment not found');

  const isParty = payment.customer.equals(req.user._id) || payment.writer.equals(req.user._id);
  if (!isParty && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'You do not have access to this payment');
  }

  res.json({ success: true, message: 'OK', data: { payment } });
});

const getPaymentByRequest = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ request: req.params.requestId });
  if (!payment) throw new ApiError(404, 'No payment found for this request');

  const isParty = payment.customer.equals(req.user._id) || payment.writer.equals(req.user._id);
  if (!isParty && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'You do not have access to this payment');
  }

  res.json({ success: true, message: 'OK', data: { payment } });
});

/**
 * List payments visible to the caller — customers/writers see their own,
 * admins see everything (also exposed at GET /api/admin/payments).
 */
const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  let filter = {};
  if (req.user.role === ROLES.CUSTOMER) filter = { customer: req.user._id };
  else if (req.user.role === ROLES.WRITER) filter = { writer: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('request', 'title')
      .populate('customer', 'fullName')
      .populate('writer', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  res.json({ success: true, message: 'OK', data: { payments, page, limit, total } });
});

/**
 * The assigned writer or an admin confirms (or disputes) that the UPI
 * transaction ID the customer submitted actually cleared. Verifying moves
 * the request to PAID; rejecting reopens it for the customer to resubmit.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  if (!['verify', 'reject'].includes(action)) {
    throw new ApiError(400, "action must be 'verify' or 'reject'");
  }

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  const isAssignedWriter = payment.writer.equals(req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isAssignedWriter && !isAdmin) {
    throw new ApiError(403, 'Only the assigned writer or an admin can verify this payment');
  }
  if (payment.status !== PAYMENT_STATUS.PENDING_VERIFICATION) {
    throw new ApiError(400, 'This payment is not awaiting verification');
  }

  const request = await Request.findById(payment.request);
  if (!request) throw new ApiError(404, 'Request not found');

  if (action === 'verify') {
    payment.status = PAYMENT_STATUS.VERIFIED;
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    request.status = REQUEST_STATUS.PAID;
  } else {
    payment.status = PAYMENT_STATUS.REJECTED;
    payment.rejectionReason = reason || 'Transaction ID could not be verified';
  }
  await Promise.all([payment.save(), request.save()]);

  await Notification.create({
    recipient: payment.customer,
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title: action === 'verify' ? 'Payment verified' : 'Payment could not be verified',
    message:
      action === 'verify'
        ? `Your payment for "${request.title}" was verified. Work can now begin.`
        : `Your payment for "${request.title}" could not be verified: ${payment.rejectionReason}. Please resubmit.`,
    relatedRequest: request._id,
  });

  res.json({ success: true, message: `Payment ${action === 'verify' ? 'verified' : 'rejected'}`, data: { payment, request } });
});

module.exports = {
  getPaymentInfo,
  createPayment,
  getPaymentById,
  getPaymentByRequest,
  listPayments,
  verifyPayment,
};
