const express = require("express");
const router = express.Router();
const {
  getAdoptionRequestsByOwner,
  getMyAdoptionRequests,
  createAdoptionRequest,
  updateAdoptionRequestStatus,
} = require("../controllers/adoptionRequestController");

// GET /adoption-requests/:email - Get adoption requests by owner email
router.get("/:email", getAdoptionRequestsByOwner);

// GET /my-adoption-requests/:email - Get adoption requests by requester email
router.get("/my/:email", getMyAdoptionRequests);

// POST /adoption-requests - Create adoption request
router.post("/", createAdoptionRequest);

// PATCH /adoption-requests/:id/status - Update adoption request status
router.patch("/:id/status", updateAdoptionRequestStatus);

module.exports = router; 