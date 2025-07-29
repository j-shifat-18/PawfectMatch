const { client } = require("../config/db");

const productsCollection = client.db("pawfect_match").collection("products");

// Get products with filtering and sorting
const getProducts = async (req, res) => {
  const { search = "", type = "", sort = "" } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (type) {
    query.type = { $regex: type, $options: "i" };
  }

  let cursor = productsCollection.find(query);

  if (sort === "price_low_high") {
    cursor = cursor.sort({ price: 1 });
  } else if (sort === "price_high_low") {
    cursor = cursor.sort({ price: -1 });
  }

  const products = await cursor.toArray();
  res.send(products);
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const product = req.body;
    product.createdAt = new Date(); // optional timestamp
    const result = await productsCollection.insertOne(product);
    res.send({ insertedId: result.insertedId });
  } catch (error) {
    console.error("Product upload error:", error);
    res.status(500).send({ error: "Failed to upload product" });
  }
};

module.exports = {
  getProducts,
  createProduct,
}; 