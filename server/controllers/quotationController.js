const Quotation = require('../models/Quotation');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { assertRequired } = require('../utils/validation');
const { ROLES, REQUEST_STATUS, QUOTATION_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

/**
 * The writer assigned to a request submits a price quote. The total is
 * always computed server-side from the request's own page/diagram counts —
 * a writer sets rates (pricePerPage, pricePerDiagram, additionalCharges),
 * not an arbitrary final number, per the brief: "Do NOT automatically force
 * the writer's price as the final price" (they can price it themselves)
 * while keeping the arithmetic trustworthy.
 */
const createQuotation = asyncHandler(async (req, res) => {
  const { pricePerPage, pricePerDiagram, additionalCharges, estimatedCompletionDate, message } = req.body;

  assertRequired(['requestId', 'pricePerPage', 'pricePerDiagram', 'estimatedCompletionDate'], req.body);

  const request = await Request.findById(req.body.requestId);
  if (!request) throw new ApiError(404, 'Request not found');

  if (!request.writer || !request.writer.equals(req.user._id)) {
    throw new ApiError(403, 'Only the writer assigned to this request can send a quotation');
  }
  if (request.status !== REQUEST_STATUS.MATCHED) {
    throw new ApiError(400, 'A quotation can only be sent while the request is awaiting one');
  }

  const pxPage = Number(pricePerPage);
  const pxDiagram = Number(pricePerDiagram);
  const extra = Number(additionalCharges) || 0;
  if ([pxPage, pxDiagram, extra].some((n) => Number.isNaN(n) || n < 0)) {
    throw new ApiError(400, 'Prices and additional charges must be valid non-negative numbers');
  }

  const completionDate = new Date(estimatedCompletionDate);
  if (Number.isNaN(completionDate.getTime())) {
    throw new ApiError(400, 'Estimated completion date is invalid');
  }

  const estimatedTotal = pxPage * request.numberOfPages + pxDiagram * request.numberOfDiagrams + extra;

  const quotation = await Quotation.create({
    request: request._id,
    writer: req.user._id,
    pricePerPage: pxPage,
    pricePerDiagram: pxDiagram,
    additionalCharges: extra,
    estimatedTotal,
    estimatedCompletionDate: completionDate,
    message: message || '',
  });

  request.status = REQUEST_STATUS.QUOTATION_SENT;
  await request.save();

  await Notification.create({
    recipient: request.customer,
    type: NOTIFICATION_TYPES.QUOTATION_RECEIVED,
    title: 'You received a quotation',
    message: `A quotation of ₹${estimatedTotal} was sent for "${request.title}".`,
    relatedRequest: request._id,
  });

  res.status(201).json({ success: true, message: 'Quotation sent', data: { quotation } });
});

const getQuotationsForRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.requestId);
  if (!request) throw new ApiError(404, 'Request not found');

  const isOwner = request.customer.equals(req.user._id);
  const isAssignedWriter = request.writer && request.writer.equals(req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isOwner && !isAssignedWriter && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this request');
  }

  const quotations = await Quotation.find({ request: request._id }).sort({ createdAt: -1 });
  res.json({ success: true, message: 'OK', data: { quotations } });
});

/**
 * Customer responds to a quotation. Accepting moves the request straight to
 * PAYMENT_PENDING (per the brief's payment flow); rejecting reopens the
 * request for the writer to send a revised quotation.
 */
const respondToQuotation = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    throw new ApiError(400, "action must be 'accept' or 'reject'");
  }

  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) throw new ApiError(404, 'Quotation not found');

  const request = await Request.findById(quotation.request);
  if (!request) throw new ApiError(404, 'Request not found');
  if (!request.customer.equals(req.user._id)) {
    throw new ApiError(403, 'Only the request owner can respond to a quotation');
  }
  if (quotation.status !== QUOTATION_STATUS.PENDING) {
    throw new ApiError(400, 'This quotation has already been responded to');
  }

  quotation.status = action === 'accept' ? QUOTATION_STATUS.ACCEPTED : QUOTATION_STATUS.REJECTED;
  quotation.respondedAt = new Date();
  await quotation.save();

  if (action === 'accept') {
    request.status = REQUEST_STATUS.PAYMENT_PENDING;
    request.acceptedQuotation = quotation._id;
  } else {
    request.status = REQUEST_STATUS.MATCHED;
  }
  await request.save();

  await Notification.create({
    recipient: quotation.writer,
    type: action === 'accept' ? NOTIFICATION_TYPES.QUOTATION_ACCEPTED : NOTIFICATION_TYPES.NEW_MESSAGE,
    title: action === 'accept' ? 'Quotation accepted' : 'Quotation declined',
    message:
      action === 'accept'
        ? `Your quotation for "${request.title}" was accepted. Waiting on payment.`
        : `Your quotation for "${request.title}" was declined. You can send a revised one.`,
    relatedRequest: request._id,
  });

  res.json({ success: true, message: `Quotation ${action}ed`, data: { quotation, request } });
});

module.exports = { createQuotation, getQuotationsForRequest, respondToQuotation };
