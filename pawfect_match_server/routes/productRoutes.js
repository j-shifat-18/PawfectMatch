const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
} = require("../controllers/productController");

// GET /products - Get products with filtering and sorting
router.get("/", getProducts);

// POST /products - Create new product
router.post("/", createProduct);

module.exports = router; 