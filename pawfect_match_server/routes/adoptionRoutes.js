const express = require("express");
const router = express.Router();
const {
  getAdoptionPosts,
  createAdoptionPost,
} = require("../controllers/adoptionController");

// GET /adoption-posts - Get adoption posts with filtering
router.get("/", getAdoptionPosts);

// POST /adoptionPosts - Create adoption post
router.post("/", createAdoptionPost);

module.exports = router; 