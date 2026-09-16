const Request = require("../models/Request");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { findMatchingWriters } = require("../services/writerMatchingService");
const { assertRequired } = require("../utils/validation");
const {
  ROLES,
  REQUEST_STATUS,
  WORK_TYPES,
  NOTIFICATION_TYPES,
} = require("../config/constants");

const ACTIVE_STATUSES = [
  REQUEST_STATUS.MATCHED,
  REQUEST_STATUS.QUOTATION_SENT,
  REQUEST_STATUS.QUOTATION_ACCEPTED,
  REQUEST_STATUS.PAYMENT_PENDING,
  REQUEST_STATUS.PAID,
  REQUEST_STATUS.IN_PROGRESS,
];

function paginationParams(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Customer submits a new request. Location/contact info comes from the
 * authenticated account, never re-typed by the user. Reference files (if
 * any) are uploaded via multer/Cloudinary (see middleware/upload.js) and
 * land on req.files.
 */
const createRequest = asyncHandler(async (req, res) => {
  const {
    workType,
    title,
    description,
    numberOfPages,
    numberOfDiagrams,
    requiredDate,
    urgency,
    state,
    district,
    city,
    budget,
    additionalInstructions,
  } = req.body;

  assertRequired(
    [
      "workType",
      "title",
      "description",
      "numberOfPages",
      "requiredDate",
      "state",
      "district",
      "city",
      "budget",
    ],
    req.body,
  );

  if (!Object.values(WORK_TYPES).includes(workType)) {
    throw new ApiError(400, "Invalid work type");
  }

  const pages = Number(numberOfPages);
  const diagrams = Number(numberOfDiagrams) || 0;
  const budgetAmount = Number(budget);

  if (Number.isNaN(pages) || pages < 1)
    throw new ApiError(400, "Number of pages must be at least 1");
  if (Number.isNaN(budgetAmount) || budgetAmount < 0)
    throw new ApiError(400, "Budget must be a valid non-negative number");

  const requiredDateObj = new Date(requiredDate);
  if (Number.isNaN(requiredDateObj.getTime()) || requiredDateObj < new Date()) {
    throw new ApiError(400, "Required date must be a valid future date");
  }

  const referenceFiles = (req.files || []).map((f) => ({
    url: f.path,
    publicId: f.filename,
    originalName: f.originalname,
  }));

  const request = await Request.create({
    customer: req.user._id,
    workType,
    title,
    description,
    numberOfPages: pages,
    numberOfDiagrams: diagrams,
    requiredDate: requiredDateObj,
    urgency: urgency === "URGENT" ? "URGENT" : "STANDARD",
    state,
    district,
    city,
    budget: budgetAmount,
    additionalInstructions: additionalInstructions || "",
    referenceFiles,
  });

  const { writers, matchedTier } = await findMatchingWriters({
    state: request.state,
    district: request.district,
    city: request.city,
  });

  if (writers.length > 0) {
    request.matchedWriters = writers.map((w) => w.user._id);
    request.status = REQUEST_STATUS.MATCHED;
    await request.save();

    await Notification.insertMany(
      writers.map((w) => ({
        recipient: w.user._id,
        type: NOTIFICATION_TYPES.REQUEST_RECEIVED,
        title: "New request near you",
        message: `${request.title} — ${pages} page(s)${diagrams ? `, ${diagrams} diagram(s)` : ""} in ${request.city}.`,
        relatedRequest: request._id,
      })),
    );
    // Real-time push over Socket.IO and email digests are wired up in Phase 7.
  }

  res.status(201).json({
    success: true,
    message:
      writers.length > 0
        ? `Request created and matched with ${writers.length} writer(s) (${matchedTier?.toLowerCase()} match).`
        : "Request created. No available writers nearby yet — we will keep looking.",
    data: { request },
  });
});

function requestVisibilityFilter(user) {
  if (user.role === ROLES.ADMIN) return {};
  if (user.role === ROLES.CUSTOMER) return { customer: user._id };
  // Writers see requests they're matched to, or have accepted.
  return { $or: [{ matchedWriters: user._id }, { writer: user._id }] };
}

const BUCKET_FILTERS = {
  active: { status: { $in: ACTIVE_STATUSES } },
  completed: { status: REQUEST_STATUS.COMPLETED },
  cancelled: { status: REQUEST_STATUS.CANCELLED },
  pending: { status: REQUEST_STATUS.PENDING },
};

const listRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  let filter = requestVisibilityFilter(req.user);

  if (req.query.bucket && BUCKET_FILTERS[req.query.bucket]) {
    filter = { ...filter, ...BUCKET_FILTERS[req.query.bucket] };
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Writer-specific buckets that need field-level distinctions beyond status:
  if (req.user.role === ROLES.WRITER) {
    if (req.query.bucket === "new") {
      filter = {
        matchedWriters: req.user._id,
        writer: null,
        status: REQUEST_STATUS.MATCHED,
      };
    } else if (req.query.bucket === "accepted") {
      filter = { writer: req.user._id, status: REQUEST_STATUS.MATCHED };
    } else if (req.query.bucket === "in_progress") {
      filter = { writer: req.user._id, status: REQUEST_STATUS.IN_PROGRESS };
    } else if (req.query.bucket === "completed") {
      filter = { writer: req.user._id, status: REQUEST_STATUS.COMPLETED };
    } else if (req.query.bucket === "cancelled") {
      filter = { writer: req.user._id, status: REQUEST_STATUS.CANCELLED };
    }
  }

  const [requests, total] = await Promise.all([
    Request.find(filter)
      .populate("customer", "fullName city district state")
      .populate("writer", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Request.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { requests, page, limit, total },
  });
});

async function loadAuthorizedRequest(req) {
  const request = await Request.findById(req.params.id)
    .populate("customer", "fullName email phone city district state")
    .populate("writer", "fullName email phone");

  if (!request) throw new ApiError(404, "Request not found");

  const { user } = req;
  const isOwner = request.customer._id.equals(user._id);
  const isAssignedWriter =
    request.writer && request.writer._id.equals(user._id);
  const isMatchedWriter = request.matchedWriters.some((id) =>
    id.equals(user._id),
  );
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isOwner && !isAssignedWriter && !isMatchedWriter && !isAdmin) {
    throw new ApiError(403, "You do not have access to this request");
  }

  return request;
}

const getRequestById = asyncHandler(async (req, res) => {
  const request = await loadAuthorizedRequest(req);
  res.json({ success: true, message: "OK", data: { request } });
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (!request.customer.equals(req.user._id))
    throw new ApiError(403, "Only the request owner can edit it");
  if (
    request.status !== REQUEST_STATUS.PENDING &&
    request.status !== REQUEST_STATUS.MATCHED
  ) {
    throw new ApiError(400, "This request can no longer be edited");
  }

  const editableFields = [
    "title",
    "description",
    "numberOfPages",
    "numberOfDiagrams",
    "requiredDate",
    "urgency",
    "budget",
    "additionalInstructions",
  ];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) request[field] = req.body[field];
  }

  await request.save();
  res.json({ success: true, message: "Request updated", data: { request } });
});

const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (!request.customer.equals(req.user._id))
    throw new ApiError(403, "Only the request owner can delete it");
  if (
    request.status !== REQUEST_STATUS.PENDING &&
    request.status !== REQUEST_STATUS.MATCHED
  ) {
    throw new ApiError(
      400,
      "Only pending or unclaimed requests can be deleted",
    );
  }

  await request.deleteOne();
  res.json({ success: true, message: "Request deleted" });
});

const cancelRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  const isOwner = request.customer.equals(req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin)
    throw new ApiError(403, "Only the request owner or an admin can cancel it");

  if (
    [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED].includes(
      request.status,
    )
  ) {
    throw new ApiError(
      400,
      `Request is already ${request.status.toLowerCase()}`,
    );
  }

  request.status = REQUEST_STATUS.CANCELLED;
  request.cancelledAt = new Date();
  request.cancelReason = req.body.reason || "";
  await request.save();

  if (request.writer) {
    await Notification.create({
      recipient: request.writer,
      type: NOTIFICATION_TYPES.REQUEST_CANCELLED,
      title: "Request cancelled",
      message: `"${request.title}" was cancelled by the customer.`,
      relatedRequest: request._id,
    });
  }

  res.json({ success: true, message: "Request cancelled", data: { request } });
});

const getMatchedWriters = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.requestId).populate({
    path: "matchedWriters",
    select: "fullName city district state",
  });
  if (!request) throw new ApiError(404, "Request not found");

  const isOwner = request.customer.equals(req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin)
    throw new ApiError(403, "You do not have access to this request");

  res.json({
    success: true,
    message: "OK",
    data: { matchedWriters: request.matchedWriters },
  });
});

/**
 * A matched writer claims the request. First writer to accept gets it;
 * afterwards it disappears from every other matched writer's "New
 * Requests" list (the listRequests bucket filters on writer === null).
 */
const writerAcceptRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  const isMatched = request.matchedWriters.some((id) =>
    id.equals(req.user._id),
  );
  if (!isMatched)
    throw new ApiError(403, "You were not matched to this request");
  if (request.writer)
    throw new ApiError(
      409,
      "This request has already been accepted by another writer",
    );
  if (request.status !== REQUEST_STATUS.MATCHED)
    throw new ApiError(400, "This request is no longer available to accept");

  request.writer = req.user._id;
  await request.save();

  await Notification.create({
    recipient: request.customer,
    type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
    title: "A writer accepted your request",
    message: `${req.user.fullName} accepted "${request.title}". They'll send a quotation shortly.`,
    relatedRequest: request._id,
  });

  res.json({ success: true, message: "Request accepted", data: { request } });
});

const writerRejectRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  const isMatched = request.matchedWriters.some((id) =>
    id.equals(req.user._id),
  );
  if (!isMatched)
    throw new ApiError(403, "You were not matched to this request");

  request.matchedWriters = request.matchedWriters.filter(
    (id) => !id.equals(req.user._id),
  );
  await request.save();

  res.json({ success: true, message: "Request declined", data: { request } });
});

const writerStartRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (!request.writer || !request.writer.equals(req.user._id)) {
    throw new ApiError(403, "Only the assigned writer can start this request");
  }
  if (request.status !== REQUEST_STATUS.PAID) {
    throw new ApiError(
      400,
      "A request can only be started after payment is verified",
    );
  }
  request.status = REQUEST_STATUS.IN_PROGRESS;
  await request.save();
  res.json({ success: true, message: "Work started", data: { request } });
});

const writerCompleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (!request.writer || !request.writer.equals(req.user._id)) {
    throw new ApiError(
      403,
      "Only the assigned writer can complete this request",
    );
  }
  if (request.status !== REQUEST_STATUS.IN_PROGRESS) {
    throw new ApiError(400, "Only an in-progress request can be completed");
  }
  request.status = REQUEST_STATUS.COMPLETED;
  request.writerMarkedCompleteAt = new Date();
  await request.save();
  res.json({
    success: true,
    message: "Request marked as completed",
    data: { request },
  });
});

module.exports = {
  createRequest,
  listRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  cancelRequest,
  getMatchedWriters,
  writerAcceptRequest,
  writerRejectRequest,
  writerStartRequest,
  writerCompleteRequest,
};
