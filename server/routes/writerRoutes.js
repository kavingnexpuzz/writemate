const express = require('express');
const {
  registerWriter,
  getMyWriterProfile,
  updateMyWriterProfile,
  searchWriters,
  getWriterPublicProfile,
} = require('../controllers/writerController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { uploadUpiQr } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.post('/register', uploadUpiQr.single('upiQrCode'), registerWriter);
router.get('/', authenticateUser, searchWriters);
router.get('/profile/me', authenticateUser, authorizeRoles(ROLES.WRITER), getMyWriterProfile);
router.put(
  '/profile/me',
  authenticateUser,
  authorizeRoles(ROLES.WRITER),
  uploadUpiQr.single('upiQrCode'),
  updateMyWriterProfile
);
router.get('/:id', authenticateUser, getWriterPublicProfile);

module.exports = router;
