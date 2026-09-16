const express = require('express');
const { registerCustomer, login, getMe, logout } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', login);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getMe);

module.exports = router;
