const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
  getDashboardStats,
} = require("../controllers/userController");
const { authenticateUser } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateUser);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.get("/dashboard-stats", getDashboardStats);

module.exports = router;
