const express = require("express");
const router = express.Router();
const { autoDetectPetInfo } = require("../controllers/aiController");

// Auto-detect pet information from image
router.post("/auto-detect-pet", autoDetectPetInfo);

module.exports = router; 