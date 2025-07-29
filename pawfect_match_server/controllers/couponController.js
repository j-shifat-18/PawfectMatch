const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const couponsCollection = client.db("pawfect_match").collection("coupons");

// Validate coupon by code
const validateCoupon = async (req, res) => {
  const { code } = req.params;

  try {
    const coupon = await couponsCollection.findOne({ code });

    if (!coupon) {
      return res.status(404).send({ message: "Coupon not found" });
    }

    const now = new Date();
    const expireDate = new Date(coupon.expireDate);

    if (expireDate < now) {
      return res.status(400).send({ message: "Coupon has expired" });
    }

    res.send({
      valid: true,
      discount: coupon.discount,
      title: coupon.title,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Get all coupons
const getAllCoupons = async (req, res) => {
  const coupons = await couponsCollection
    .find()
    .sort({ expireDate: -1 })
    .toArray();
  res.send(coupons);
};

// Create new coupon
const createCoupon = async (req, res) => {
  const { title, description, code, discount, expireDate } = req.body;

  if (!title || !description || !code || !discount || !expireDate) {
    return res.status(400).send({ message: "All fields are required" });
  }

  const exists = await couponsCollection.findOne({ code });
  if (exists) {
    return res.status(409).send({ message: "Coupon code already exists" });
  }

  const result = await couponsCollection.insertOne({
    title,
    description,
    code,
    discount: parseFloat(discount),
    expireDate: new Date(expireDate),
    createdAt: new Date(),
  });

  res.send(result);
};

// Update coupon expire date
const updateCouponExpireDate = async (req, res) => {
  const { id } = req.params;
  const { expireDate } = req.body;

  if (!expireDate) {
    return res.status(400).send({ message: "Expire date is required" });
  }

  const result = await couponsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { expireDate: new Date(expireDate) } }
  );

  res.send(result);
};

// Legacy coupon validation (for backward compatibility)
const getCouponByCode = async (req, res) => {
  const code = req.params.code;
  const today = new Date();

  const coupon = await couponsCollection.findOne({
    code,
    expireDate: { $gte: today },
  });

  if (!coupon) {
    return res
      .status(404)
      .send({ valid: false, message: "Invalid or expired coupon" });
  }

  res.send({ valid: true, discount: coupon.discount });
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCouponExpireDate,
  getCouponByCode,
}; 