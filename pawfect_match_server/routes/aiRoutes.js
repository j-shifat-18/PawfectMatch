const express = require("express");
const router = express.Router();
const { autoDetectPetInfo, getAIMatches } = require("../controllers/aiController");

// Auto-detect pet information from image
router.post("/auto-detect-pet", autoDetectPetInfo);

// Get AI-powered pet matches
router.get("/matches", getAIMatches);

module.exports = router; 