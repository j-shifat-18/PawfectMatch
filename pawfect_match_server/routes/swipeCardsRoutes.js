const express = require("express");
const router = express.Router();
const {
  getSwipeCards,
  handleSwipe,
} = require("../controllers/swipeCardsController");

// GET /swipecards - Get cards for swiping
router.get("/", getSwipeCards);

// POST /swipecards/swipe - Handle card swipe (right/left)
router.post("/swipe", handleSwipe);

module.exports = router; 