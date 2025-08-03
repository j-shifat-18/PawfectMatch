const express = require("express");
const router = express.Router();
const {
  getSwipeCards,
  handleSwipe,
} = require("../controllers/swipeCardsController");
const { verifyFBToken } = require("../middlewares/authMiddleware");

// GET /swipecards - Get cards for swiping
router.get("/", getSwipeCards);

// POST /swipecards/swipe - Handle card swipe (right/left)
router.post("/swipe",verifyFBToken, handleSwipe);

module.exports = router; 