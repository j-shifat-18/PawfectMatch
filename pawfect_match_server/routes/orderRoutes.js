const express = require("express");
const router = express.Router();
const {
  getPaidOrders,
  getOrderById,
  createOrder,
  markOrderAsPaid,
  updateDeliveryStatus,
} = require("../controllers/orderController");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyFBToken } = require("../middlewares/authMiddleware");

// GET /orders - Get paid orders
router.get("/",verifyFBToken, getPaidOrders);

// GET /orders/:id - Get order by ID
router.get("/:id",verifyFBToken, getOrderById);

// POST /orders - Create new order
router.post("/",verifyFBToken, createOrder);

// PATCH /orders/paid/:id - Mark order as paid
router.patch("/paid/:id",verifyFBToken, markOrderAsPaid);

// PATCH /orders/:id - Update delivery status
router.patch("/:id",verifyFBToken,verifyAdmin, updateDeliveryStatus);

module.exports = router; 