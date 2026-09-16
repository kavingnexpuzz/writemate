const express = require("express");
const {
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
} = require("../controllers/adminController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(authenticateUser, authorizeRoles(ROLES.ADMIN));

router.get("/dashboard", getDashboardStats);
router.get("/customers", listCustomers);
router.get("/writers", listWriters);
router.get("/requests", listAllRequests);
router.get("/payments", listAllPayments);
router.get("/reviews", listAllReviews);
router.get("/complaints", listAllComplaints);
router.put("/complaints/:id", updateComplaint);
router.get("/locations", listLocations);
router.put("/writers/:id/approve", approveWriter);
router.put("/writers/:id/reject", rejectWriter);
router.put("/writers/:id/block", blockWriter);
router.put("/writers/:id/unblock", unblockWriter);

module.exports = router;
