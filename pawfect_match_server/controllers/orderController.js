const { client } = require("../config/db");
const { ObjectId } = require("mongodb");
const { uuidv4 } = require("../utils/uuid");

const ordersCollection = client.db("pawfect_match").collection("orders");
const productsCollection = client.db("pawfect_match").collection("products");

// Get paid orders
const getPaidOrders = async (req, res) => {
  const buyerEmail = req.query.email;

  const filter = { payment_status: "paid" };
  if (buyerEmail) {
    filter.buyerEmail = buyerEmail;
  }

  try {
    const paidOrders = await ordersCollection
      .find(filter)
      .sort({ payment_date: -1 }) // Latest orders first
      .toArray();

    res.send(paidOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  const id = req.params.id;
  const result = await ordersCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
};

// Create new order
const createOrder = async (req, res) => {
  const { productId, buyerEmail, price } = req.body;

  const product = await productsCollection.findOne({
    _id: new ObjectId(productId),
  });

  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }

  const order = {
    buyerEmail,
    productId,
    productName: product.name,
    productImage: product.image,
    price,
    payment_status: "pending",
    delivery_status: "pending",
    order_date: new Date(),
  };

  const result = await ordersCollection.insertOne(order);
  res.send(result);
};

// Mark order as paid
const markOrderAsPaid = async (req, res) => {
  const orderId = req.params.id;

  try {
    const transactionId = uuidv4(); // Generate a unique transaction ID

    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          payment_status: "paid",
          payment_date: new Date(),
          transactionId: transactionId,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ message: "Order not found or already paid" });
    }

    res.send({ message: "Order marked as paid", transactionId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["delivered", "rejected"].includes(status)) {
    return res.status(400).send({ message: "Invalid status" });
  }

  const result = await ordersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { delivery_status: status } }
  );

  if (result.modifiedCount === 1) {
    res.send({ message: "Delivery status updated", status });
  } else {
    res.status(404).send({ message: "Order not found" });
  }
};

module.exports = {
  getPaidOrders,
  getOrderById,
  createOrder,
  markOrderAsPaid,
  updateDeliveryStatus,
}; 