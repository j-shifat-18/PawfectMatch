const express = require("express");
const router = express.Router();
const {
  getAdoptionRequestsByOwner,
  getMyAdoptionRequests,
  createAdoptionRequest,
  updateAdoptionRequestStatus,
} = require("../controllers/adoptionRequestController");
const { verifyFBToken } = require("../middlewares/authMiddleware");

// GET /adoption-requests/:email - Get adoption requests by owner email
router.get("/:email",verifyFBToken, getAdoptionRequestsByOwner);

// GET /my-adoption-requests/:email - Get adoption requests by requester email
// router.get("/my-adoption-requests/:email", getMyAdoptionRequests);

// POST /adoption-requests - Create adoption request
router.post("/",verifyFBToken, createAdoptionRequest);

// PATCH /adoption-requests/:id/status - Update adoption request status
router.patch("/:id/status",verifyFBToken, updateAdoptionRequestStatus);

module.exports = router; 