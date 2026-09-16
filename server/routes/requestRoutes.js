const express = require("express");
const {
  createRequest,
  listRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  cancelRequest,
  getMatchedWriters,
  writerAcceptRequest,
  writerRejectRequest,
  writerStartRequest,
  writerCompleteRequest,
} = require("../controllers/requestController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { uploadRequestFiles } = require("../middleware/upload");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(authenticateUser);

router.post(
  "/",
  authorizeRoles(ROLES.CUSTOMER),
  uploadRequestFiles.array("referenceFiles", 5),
  createRequest,
);
router.get("/", listRequests);
router.get("/matched-writers/:requestId", getMatchedWriters);
router.get("/:id", getRequestById);
router.put("/:id", authorizeRoles(ROLES.CUSTOMER), updateRequest);
router.delete("/:id", authorizeRoles(ROLES.CUSTOMER), deleteRequest);
router.post("/:id/cancel", cancelRequest);
router.post("/:id/accept", authorizeRoles(ROLES.WRITER), writerAcceptRequest);
router.post("/:id/reject", authorizeRoles(ROLES.WRITER), writerRejectRequest);
router.post("/:id/start", authorizeRoles(ROLES.WRITER), writerStartRequest);
router.post(
  "/:id/complete",
  authorizeRoles(ROLES.WRITER),
  writerCompleteRequest,
);

module.exports = router;
