const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const WriterProfile = require("../models/WriterProfile");
const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const { sendEmail } = require("../utils/sendEmail");
const { ROLES, WRITER_STATUS } = require("../config/constants");
const {
  assertRequired,
  assertValidEmail,
  assertValidPhone,
  assertValidPassword,
  assertPasswordsMatch,
} = require("../utils/validation");

const SALT_ROUNDS = 12;

/**
 * Writer registration creates a User (role=WRITER) and a linked
 * WriterProfile with status=PENDING. Writers cannot accept requests until
 * an admin approves them (see Phase 3 admin approval endpoints).
 * The UPI QR code is uploaded via multer/Cloudinary (see middleware/upload.js)
 * and its resulting URL is expected at req.file.secure_url.
 */
const registerWriter = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    state,
    district,
    city,
    pricePerPage,
    pricePerDiagram,
    upiId,
    bio,
    serviceDescription,
  } = req.body;

  assertRequired(
    [
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "state",
      "district",
      "city",
      "pricePerPage",
      "pricePerDiagram",
      "upiId",
      "bio",
      "serviceDescription",
    ],
    req.body,
  );
  assertValidEmail(email);
  assertValidPhone(phone);
  assertValidPassword(password);
  assertPasswordsMatch(password, confirmPassword);

  if (!req.file) {
    throw new ApiError(400, "UPI QR code image is required");
  }
  if (!req.file.secure_url) {
    throw new ApiError(502, "UPI QR code upload did not return a usable URL");
  }

  const pricePage = Number(pricePerPage);
  const priceDiagram = Number(pricePerDiagram);
  if (
    Number.isNaN(pricePage) ||
    pricePage < 0 ||
    Number.isNaN(priceDiagram) ||
    priceDiagram < 0
  ) {
    throw new ApiError(
      400,
      "Price per page and price per diagram must be valid non-negative numbers",
    );
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const session = await mongoose.startSession();
  let user;
  let profile;

  try {
    await session.withTransaction(async () => {
      const created = await User.create(
        [
          {
            fullName,
            email,
            phone,
            passwordHash,
            role: ROLES.WRITER,
            state,
            district,
            city,
          },
        ],
        { session },
      );
      user = created[0];

      const createdProfile = await WriterProfile.create(
        [
          {
            user: user._id,
            status: WRITER_STATUS.PENDING,
            pricePerPage: pricePage,
            pricePerDiagram: priceDiagram,
            upiId,
            upiQrCodeUrl: req.file.secure_url,
            bio,
            serviceDescription,
            state,
            district,
            city,
          },
        ],
        { session },
      );
      profile = createdProfile[0];
    });
  } finally {
    session.endSession();
  }

  sendEmail({
    to: user.email,
    subject: "WriteMate — Application received",
    html: `<p>Hi ${user.fullName}, thanks for applying to write on WriteMate. Your application is pending admin review — we'll email you once it's approved.</p>`,
  }).catch((err) => console.error("Writer welcome email failed:", err.message));

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({
    success: true,
    message:
      "Writer application submitted. Your account is pending admin approval.",
    data: {
      user: user.toJSON(),
      writerProfile: profile,
      accessToken,
      refreshToken,
    },
  });
});

const getMyWriterProfile = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new ApiError(404, "Writer profile not found");
  }
  res.json({ success: true, message: "OK", data: { writerProfile: profile } });
});

const WRITER_EDITABLE_FIELDS = [
  "pricePerPage",
  "pricePerDiagram",
  "bio",
  "serviceDescription",
  "isAvailable",
  "upiId",
];

const updateMyWriterProfile = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, "Writer profile not found");

  for (const field of WRITER_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  }
  if (req.file) {
    if (!req.file.secure_url) {
      throw new ApiError(502, "UPI QR code upload did not return a usable URL");
    }
    profile.upiQrCodeUrl = req.file.secure_url;
  }

  await profile.save();
  res.json({
    success: true,
    message: "Profile updated",
    data: { writerProfile: profile },
  });
});

function paginationParams(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Customer-facing writer search (Find Writers). Only ever returns
 * APPROVED + available writers, and only the fields a customer needs to
 * decide who to work with — never contact info or the UPI QR (that's
 * shared later, once a quotation is accepted).
 */
const searchWriters = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginationParams(req);
  const { state, district, city, minPrice, maxPrice, minRating } = req.query;

  const filter = { status: WRITER_STATUS.APPROVED };
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (city) filter.city = city;
  if (req.query.availability === "true") filter.isAvailable = true;
  if (minPrice || maxPrice) {
    filter.pricePerPage = {};
    if (minPrice) filter.pricePerPage.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerPage.$lte = Number(maxPrice);
  }
  if (minRating) filter.ratingAverage = { $gte: Number(minRating) };

  const [writers, total] = await Promise.all([
    WriterProfile.find(filter)
      .populate("user", "fullName avatarUrl city district")
      .select("-upiId -upiQrCodeUrl -rejectionReason")
      .sort({ ratingAverage: -1, completedJobs: -1 })
      .skip(skip)
      .limit(limit),
    WriterProfile.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { writers, page, limit, total },
  });
});

/**
 * Public writer profile page. Same privacy rule as search: no contact
 * info, no UPI details until a quotation has been accepted.
 */
const getWriterPublicProfile = asyncHandler(async (req, res) => {
  const profile = await WriterProfile.findOne({
    user: req.params.id,
    status: WRITER_STATUS.APPROVED,
  })
    .populate("user", "fullName avatarUrl city district state")
    .select("-upiId -upiQrCodeUrl -rejectionReason");

  if (!profile) throw new ApiError(404, "Writer not found");

  const reviews = await Review.find({ writer: req.params.id })
    .populate("customer", "fullName")
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    message: "OK",
    data: { writerProfile: profile, reviews },
  });
});

module.exports = {
  registerWriter,
  getMyWriterProfile,
  updateMyWriterProfile,
  searchWriters,
  getWriterPublicProfile,
};
