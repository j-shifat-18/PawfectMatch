const express = require("express");
const router = express.Router();
const {
  getCartItems,
  removeFromCart,
  updateCartItem,
} = require("../controllers/cartController");
const { verifyFBToken } = require("../middlewares/authMiddleware");

// GET /cart - Get cart items (unpaid orders for a specific user)
router.get("/",verifyFBToken, getCartItems);

// DELETE /cart/:orderId - Remove item from cart
router.delete("/:orderId",verifyFBToken, removeFromCart);

// PATCH /cart/:orderId - Update cart item
router.patch("/:orderId",verifyFBToken, updateCartItem);

module.exports = router; 