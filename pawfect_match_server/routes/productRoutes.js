const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
} = require("../controllers/productController");
const { verifyFBToken } = require("../middlewares/authMiddleware");
const { verifyAdmin } = require("../middlewares/verifyAdmin");

// GET /products - Get products with filtering and sorting
router.get("/", getProducts);

// POST /products - Create new product
router.post("/",verifyFBToken,verifyAdmin, createProduct);

module.exports = router; 