const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/sendEmail');
const { ROLES } = require('../config/constants');
const {
  assertRequired,
  assertValidEmail,
  assertValidPhone,
  assertValidPassword,
  assertPasswordsMatch,
} = require('../utils/validation');

const SALT_ROUNDS = 12;

function buildAuthResponse(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { user: user.toJSON(), accessToken, refreshToken };
}

/**
 * Registers a CUSTOMER account. Writer registration has its own endpoint
 * (POST /api/writers/register) since it collects extra fields and creates
 * a WriterProfile in a PENDING state.
 */
const registerCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, state, district, city } = req.body;

  assertRequired(['fullName', 'email', 'phone', 'password', 'confirmPassword', 'state', 'district', 'city'], req.body);
  assertValidEmail(email);
  assertValidPhone(phone);
  assertValidPassword(password);
  assertPasswordsMatch(password, confirmPassword);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    fullName,
    email,
    phone,
    passwordHash,
    role: ROLES.CUSTOMER,
    state,
    district,
    city,
  });

  sendEmail({
    to: user.email,
    subject: 'Welcome to WriteMate',
    html: `<p>Hi ${user.fullName}, your WriteMate account has been created.</p>`,
  }).catch((err) => console.error('Welcome email failed:', err.message));

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: buildAuthResponse(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  assertRequired(['email', 'password'], req.body);

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact support.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: buildAuthResponse(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'OK', data: { user: req.user } });
});

// Stateless JWT: logout is a frontend concern (discard the tokens). This
// endpoint exists for symmetry and as a hook point if a token blocklist is
// added later.
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = { registerCustomer, login, getMe, logout };
