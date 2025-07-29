const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const ordersCollection = client.db("pawfect_match").collection("orders");

// Get cart items (unpaid orders for a specific user)
const getCartItems = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const cartItems = await ordersCollection
      .find({ buyerEmail: email, payment_status: "pending" })
      .toArray();

    res.send(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Remove item from cart (delete unpaid order)
const removeFromCart = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const result = await ordersCollection.deleteOne({
      _id: new ObjectId(orderId),
      buyerEmail: email,
      payment_status: "pending"
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Cart item not found" });
    }

    res.send({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Update cart item quantity (update order)
const updateCartItem = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;
    const updates = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const result = await ordersCollection.updateOne(
      {
        _id: new ObjectId(orderId),
        buyerEmail: email,
        payment_status: "pending"
      },
      { $set: updates }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "Cart item not found" });
    }

    res.send({ message: "Cart item updated" });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCartItems,
  removeFromCart,
  updateCartItem,
}; 