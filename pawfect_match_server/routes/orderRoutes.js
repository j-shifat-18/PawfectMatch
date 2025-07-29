const express = require("express");
const router = express.Router();
const {
  getPaidOrders,
  getOrderById,
  createOrder,
  markOrderAsPaid,
  updateDeliveryStatus,
} = require("../controllers/orderController");

// GET /orders - Get paid orders
router.get("/", getPaidOrders);

// GET /orders/:id - Get order by ID
router.get("/:id", getOrderById);

// POST /orders - Create new order
router.post("/", createOrder);

// PATCH /orders/paid/:id - Mark order as paid
router.patch("/paid/:id", markOrderAsPaid);

// PATCH /orders/:id - Update delivery status
router.patch("/:id", updateDeliveryStatus);

module.exports = router; 