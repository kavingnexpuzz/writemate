const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Request = require("../models/Request");
const WriterProfile = require("../models/WriterProfile");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const {
  ROLES,
  REQUEST_STATUS,
  PAYMENT_STATUS,
} = require("../config/constants");
const {
  assertRequired,
  assertValidPassword,
  assertPasswordsMatch,
} = require("../utils/validation");

const ALLOWED_UPDATE_FIELDS = [
  "fullName",
  "phone",
  "state",
  "district",
  "city",
  "avatarUrl",
];

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "OK", data: { user: req.user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  assertRequired(
    ["currentPassword", "newPassword", "confirmPassword"],
    req.body,
  );
  assertValidPassword(newPassword);
  assertPasswordsMatch(newPassword, confirmPassword);

  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, "Current password is incorrect");
  }
  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password",
    );
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: "Password changed successfully" });
});

const ACTIVE_STATUSES = [
  REQUEST_STATUS.MATCHED,
  REQUEST_STATUS.QUOTATION_SENT,
  REQUEST_STATUS.QUOTATION_ACCEPTED,
  REQUEST_STATUS.PAYMENT_PENDING,
  REQUEST_STATUS.PAID,
  REQUEST_STATUS.IN_PROGRESS,
];

/**
 * Dashboard stat cards for the currently logged-in user. Shape depends on
 * role since customers and writers see different cards (see Request model —
 * request creation ships in Phase 4, so these counts are correct but will
 * read as zero until then).
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.CUSTOMER) {
    const [total, pending, active, completed] = await Promise.all([
      Request.countDocuments({ customer: req.user._id }),
      Request.countDocuments({
        customer: req.user._id,
        status: REQUEST_STATUS.PENDING,
      }),
      Request.countDocuments({
        customer: req.user._id,
        status: { $in: ACTIVE_STATUSES },
      }),
      Request.countDocuments({
        customer: req.user._id,
        status: REQUEST_STATUS.COMPLETED,
      }),
    ]);

    return res.json({
      success: true,
      message: "OK",
      data: {
        totalRequests: total,
        pendingRequests: pending,
        activeJobs: active,
        completedJobs: completed,
      },
    });
  }

  if (req.user.role === ROLES.WRITER) {
    const [
      newRequests,
      accepted,
      inProgress,
      completed,
      cancelled,
      profile,
      verifiedPayments,
      reviewCount,
    ] = await Promise.all([
      Request.countDocuments({
        matchedWriters: req.user._id,
        writer: null,
        status: REQUEST_STATUS.MATCHED,
      }),
      Request.countDocuments({
        writer: req.user._id,
        status: {
          $in: [
            REQUEST_STATUS.MATCHED,
            REQUEST_STATUS.QUOTATION_SENT,
            REQUEST_STATUS.QUOTATION_ACCEPTED,
            REQUEST_STATUS.PAYMENT_PENDING,
            REQUEST_STATUS.PAID,
          ],
        },
      }),
      Request.countDocuments({
        writer: req.user._id,
        status: REQUEST_STATUS.IN_PROGRESS,
      }),
      Request.countDocuments({
        writer: req.user._id,
        status: REQUEST_STATUS.COMPLETED,
      }),
      Request.countDocuments({
        writer: req.user._id,
        status: REQUEST_STATUS.CANCELLED,
      }),
      WriterProfile.findOne({ user: req.user._id }),
      Payment.aggregate([
        { $match: { writer: req.user._id, status: PAYMENT_STATUS.VERIFIED } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Review.countDocuments({ writer: req.user._id }),
    ]);

    return res.json({
      success: true,
      message: "OK",
      data: {
        newRequests,
        acceptedJobs: accepted,
        inProgress,
        completed,
        cancelled,
        earnings: verifiedPayments[0]?.total || 0,
        ratingAverage: profile?.ratingAverage || 0,
        reviewCount,
        writerStatus: profile?.status || null,
      },
    });
  }

  res.json({ success: true, message: "OK", data: {} });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getDashboardStats,
};
