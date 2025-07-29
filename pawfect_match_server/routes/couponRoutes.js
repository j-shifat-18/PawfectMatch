const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCouponExpireDate,
  getCouponByCode,
} = require("../controllers/couponController");

// GET /validate-coupon/:code - Validate coupon by code
router.get("/validate/:code", validateCoupon);

// GET /coupons - Get all coupons
router.get("/", getAllCoupons);

// POST /coupons - Create new coupon
router.post("/", createCoupon);

// PATCH /coupons/:id - Update coupon expire date
router.patch("/:id", updateCouponExpireDate);

// GET /coupons/:code - Legacy coupon validation
router.get("/:code", getCouponByCode);

module.exports = router; 