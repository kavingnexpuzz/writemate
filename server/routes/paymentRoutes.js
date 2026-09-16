const express = require('express');
const {
  getPaymentInfo,
  createPayment,
  getPaymentById,
  getPaymentByRequest,
  listPayments,
  verifyPayment,
} = require('../controllers/paymentController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticateUser);

router.get('/payment-info/:requestId', authorizeRoles(ROLES.CUSTOMER), getPaymentInfo);
router.get('/request/:requestId', getPaymentByRequest);
router.get('/', listPayments);
router.post('/', authorizeRoles(ROLES.CUSTOMER), createPayment);
router.get('/:id', getPaymentById);
router.put('/:id/verify', verifyPayment);

module.exports = router;
