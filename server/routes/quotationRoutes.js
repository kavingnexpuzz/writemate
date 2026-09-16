const express = require('express');
const { createQuotation, getQuotationsForRequest, respondToQuotation } = require('../controllers/quotationController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticateUser);

router.post('/', authorizeRoles(ROLES.WRITER), createQuotation);
router.get('/:requestId', getQuotationsForRequest);
router.put('/:id', authorizeRoles(ROLES.CUSTOMER), respondToQuotation);

module.exports = router;
