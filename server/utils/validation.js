const validator = require('validator');
const { ApiError } = require('../middleware/errorHandler');

const PHONE_REGEX = /^[0-9]{10}$/; // 10-digit local number; adjust if supporting +country codes

function assertRequired(fields, body) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`);
  }
}

function assertValidEmail(email) {
  if (!validator.isEmail(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }
}

function assertValidPhone(phone) {
  if (!PHONE_REGEX.test(phone)) {
    throw new ApiError(400, 'Please provide a valid 10-digit phone number');
  }
}

function assertValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }
}

function assertPasswordsMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    throw new ApiError(400, 'Password and confirm password do not match');
  }
}

module.exports = {
  assertRequired,
  assertValidEmail,
  assertValidPhone,
  assertValidPassword,
  assertPasswordsMatch,
};
