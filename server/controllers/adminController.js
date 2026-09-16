const User = require("../models/User");
const WriterProfile = require("../models/WriterProfile");
const Request = require("../models/Request");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { sendEmail } = require("../utils/sendEmail");
const {
  ROLES,
  WRITER_STATUS,
  REQUEST_STATUS,
  PAYMENT_STATUS,
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

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalCustomers,
    totalWriters,
    pendingApprovals,
    activeRequests,
    completedRequests,
    cancelledRequests,
    paymentAgg,
    totalPaymentsCount,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.CUSTOMER }),
    User.countDocuments({ role: ROLES.WRITER }),
    WriterProfile.countDocuments({ status: WRITER_STATUS.PENDING }),
    Request.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
    Request.countDocuments({ status: REQUEST_STATUS.COMPLETED }),
    Request.countDocuments({ status: REQUEST_STATUS.CANCELLED }),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.VERIFIED } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.countDocuments({ status: PAYMENT_STATUS.VERIFIED }),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: {
      totalCustomers,
      totalWriters,
      pendingWriterApprovals: pendingApprovals,
      activeRequests,
      completedRequests,
      cancelledRequests,
      totalPayments: totalPaymentsCount,
      platformRevenue: paymentAgg[0]?.total || 0,
    },
  });
});

function paginationParams(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const filter = { role: ROLES.CUSTOMER };
  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { customers, page, limit, total },
  });
});

const listWriters = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [profiles, total] = await Promise.all([
    WriterProfile.find(filter)
      .populate("user", "fullName email phone state district city createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WriterProfile.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { writers: profiles, page, limit, total },
  });
});

const listAllRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [requests, total] = await Promise.all([
    Request.find(filter)
      .populate("customer", "fullName email city")
      .populate("writer", "fullName email")
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

const listAllPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("request", "title")
      .populate("customer", "fullName email")
      .populate("writer", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { payments, page, limit, total },
  });
});

const listAllReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const [reviews, total] = await Promise.all([
    Review.find({})
      .populate("request", "title")
      .populate("customer", "fullName email")
      .populate("writer", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { reviews, page, limit, total },
  });
});

const listAllComplaints = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate("request", "title status")
      .populate("raisedBy", "fullName email role")
      .populate("resolvedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { complaints, page, limit, total },
  });
});

const updateComplaint = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;
  if (
    !Object.values(require("../config/constants").COMPLAINT_STATUS).includes(
      status,
    )
  ) {
    throw new ApiError(400, "Invalid complaint status");
  }
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  complaint.status = status;
  complaint.adminResponse = adminResponse || "";
  complaint.resolvedBy = ["RESOLVED", "REJECTED"].includes(status)
    ? req.user._id
    : null;
  complaint.resolvedAt = ["RESOLVED", "REJECTED"].includes(status)
    ? new Date()
    : null;
  await complaint.save();

  res.json({
    success: true,
    message: "Complaint updated",
    data: { complaint },
  });
});

const listLocations = asyncHandler(async (req, res) => {
  const [userLocations, writerLocations] = await Promise.all([
    User.aggregate([
      { $match: { state: { $nin: [null, ""] } } },
      {
        $group: {
          _id: { state: "$state", district: "$district", city: "$city" },
        },
      },
    ]),
    WriterProfile.aggregate([
      { $match: { state: { $nin: [null, ""] } } },
      {
        $group: {
          _id: { state: "$state", district: "$district", city: "$city" },
        },
      },
    ]),
  ]);
  const locations = new Map();
  [...userLocations, ...writerLocations].forEach(({ _id }) => {
    const key = `${_id.state}|${_id.district || ""}|${_id.city || ""}`;
    locations.set(key, _id);
  });
  res.json({
    success: true,
    message: "OK",
    data: {
      locations: [...locations.values()].sort((a, b) =>
        `${a.state}${a.district}${a.city}`.localeCompare(
          `${b.state}${b.district}${b.city}`,
        ),
      ),
    },
  });
});

async function notifyWriter(userId, type, title, message) {
  await Notification.create({ recipient: userId, type, title, message });
}

const approveWriter = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findById(req.params.id).populate(
    "user",
    "fullName email",
  );
  if (!profile) throw new ApiError(404, "Writer profile not found");

  profile.status = WRITER_STATUS.APPROVED;
  profile.approvedAt = new Date();
  profile.rejectionReason = "";
  await profile.save();

  await notifyWriter(
    profile.user._id,
    NOTIFICATION_TYPES.REQUEST_ACCEPTED,
    "Application approved",
    "Your WriteMate writer application has been approved. You can now accept requests.",
  );

  sendEmail({
    to: profile.user.email,
    subject: "WriteMate — You are approved!",
    html: `<p>Hi ${profile.user.fullName}, your writer application has been approved. You can now start accepting requests.</p>`,
  }).catch((err) => console.error("Approval email failed:", err.message));

  res.json({
    success: true,
    message: "Writer approved",
    data: { writerProfile: profile },
  });
});

const rejectWriter = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findById(req.params.id).populate(
    "user",
    "fullName email",
  );
  if (!profile) throw new ApiError(404, "Writer profile not found");

  profile.status = WRITER_STATUS.REJECTED;
  profile.rejectionReason =
    req.body.reason || "Application did not meet platform requirements";
  await profile.save();

  sendEmail({
    to: profile.user.email,
    subject: "WriteMate — Application update",
    html: `<p>Hi ${profile.user.fullName}, unfortunately your writer application was not approved. Reason: ${profile.rejectionReason}</p>`,
  }).catch((err) => console.error("Rejection email failed:", err.message));

  res.json({
    success: true,
    message: "Writer rejected",
    data: { writerProfile: profile },
  });
});

const blockWriter = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, "Writer profile not found");

  profile.status = WRITER_STATUS.BLOCKED;
  profile.blockedAt = new Date();
  await profile.save();

  res.json({
    success: true,
    message: "Writer blocked",
    data: { writerProfile: profile },
  });
});

const unblockWriter = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, "Writer profile not found");

  profile.status = WRITER_STATUS.APPROVED;
  profile.blockedAt = null;
  await profile.save();

  res.json({
    success: true,
    message: "Writer unblocked",
    data: { writerProfile: profile },
  });
});

module.exports = {
  getDashboardStats,
  listCustomers,
  listWriters,
  listAllRequests,
  listAllPayments,
  listAllReviews,
  listAllComplaints,
  updateComplaint,
  listLocations,
  approveWriter,
  rejectWriter,
  blockWriter,
  unblockWriter,
};
