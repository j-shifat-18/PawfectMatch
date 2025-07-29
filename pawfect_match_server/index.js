require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid"); // uuid for unique ID

const app = express();
const port = process.env.PORT || 3000;

// firebase admin setup
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf8"
);

const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // using cookies/auth headers
  })
);

app.use(express.json());

// verify firebase token
const verifyFBToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized access" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.decoded = decodedUser;
    next();
  } catch (error) {
    return res.status(403).send({ error: true, message: "Forbidden" });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.psjt8aa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("pawfect_match").collection("users");
    const petsCollection = client.db("pawfect_match").collection("pets");
    const ordersCollection = client.db("pawfect_match").collection("orders");
    const couponsCollection = client.db("pawfect_match").collection("coupons");
    const productsCollection = client
      .db("pawfect_match")
      .collection("products");
    const adoptionRequestsCollection = client
      .db("pawfect_match")
      .collection("adoption-requests");
    const favoritesCollection = client
      .db("pawfect_match")
      .collection("favourites");
    const adoptionPostsCollection = client
      .db("pawfect_match")
      .collection("adoption-posts");

    // verify admin
    const verifyAdmin = async (req, res, next) => {
      try {
        const email = req.decoded?.email;
        if (!email) {
          return res.status(401).send({ error: true, message: "Unauthorized" });
        }

        const user = await usersCollection.findOne({ email });

        if (!user || user.role !== "admin") {
          return res
            .status(403)
            .send({ error: true, message: "Forbidden: Admins only" });
        }

        next();
      } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).send({ error: true, message: "Internal server error" });
      }
    };

    // users
    app.get("/users", async (req, res) => {
      const { email, role } = req.query;

      const filter = {};
      if (email) filter.email = email;
      if (role) filter.role = role;

      try {
        const users = await usersCollection.find(filter).toArray();
        // If specific email is queried and only one result is expected
        if (email && !role) {
          return res.send(users[0] || null);
        }
        res.send(users);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch users" });
      }
    });

    app.post("/users", async (req, res) => {
      const email = req.body.email;
      const userExists = await usersCollection.findOne({ email });
      if (userExists) {
        // update last login info
        return res
          .status(200)
          .send({ message: "user already exists", inserted: false });
      }

      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // PATCH /users/:email
    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body;

      try {
        const result = await usersCollection.updateOne(
          { email },
          { $set: updatedData }
        );
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to update user" });
      }
    });

    // pets

    // get all pets for a user
    // app.get("/pets", async (req, res) => {
    //   try {
    //     const { ownerId } = req.query;
    //     const pets = await petsCollection.find({ ownerId }).toArray();
    //     res.json(pets);
    //   } catch (err) {
    //     console.error("Error fetching pets:", err);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    app.get("/pets", async (req, res) => {
      try {
        const { ownerEmail } = req.query;
        const pets = await petsCollection.find({ ownerEmail }).toArray();
        res.json(pets);
      } catch (err) {
        console.error("Error fetching pets:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/pets/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid pet ID" });
        }

        const pet = await petsCollection.findOne({ _id: new ObjectId(id) });

        if (!pet) {
          return res.status(404).json({ error: "Pet not found" });
        }

        res.send(pet);
      } catch (error) {
        console.error("Failed to fetch pet by ID:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/pets", async (req, res) => {
      try {
        const pet = req.body;
        pet.createdAt = new Date();
        const result = await petsCollection.insertOne(pet);
        res.status(201).json(result);
      } catch (err) {
        console.error("Error creating pet:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // update pet info
    app.patch("/pets/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const result = await petsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updates }
        );
        res.json(result);
      } catch (err) {
        console.error("Error updating pet:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/pets/:id/adoption", async (req, res) => {
      try {
        const id = req.params.id;
        const { isListedForAdoption } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid pet ID" });
        }

        const result = await petsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              isListedForAdoption: isListedForAdoption,
            },
          }
        );

        res.send(result);
      } catch (error) {
        console.error("Error updating pet adoption status:", error);
        res.status(500).json({ error: "Failed to update pet adoption status" });
      }
    });

    // PATCH /pets/:id/transfer
    // Body: { newOwnerEmail: string }
    app.patch("/pets/:id/transfer", async (req, res) => {
      const { id } = req.params;
      const { newOwnerEmail } = req.body;

      try {
        const result = await petsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              ownerEmail: newOwnerEmail,
              listed: false,
            },
          }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to transfer pet ownership" });
      }
    });

    // Adoption post

    app.get("/adoption-posts", async (req, res) => {
      try {
        const { search = "", type = "", availability = "" } = req.query;

        // Build query filters for pets
        const petQuery = {};

        if (search) {
          petQuery.name = { $regex: search, $options: "i" };
        }

        if (type) {
          petQuery.type = type;
        }

        if (availability === "available") {
          petQuery.isAdopted = false;
        } else if (availability === "adopted") {
          petQuery.isAdopted = true;
        }

        // Find matching pets
        const matchingPets = await petsCollection.find(petQuery).toArray();
        const matchingPetIds = matchingPets.map((pet) => pet._id.toString());

        // Get adoption posts where petId is in matchingPetIds
        const adoptionPosts = await adoptionPostsCollection
          .find({ petId: { $in: matchingPetIds } })
          .sort({ createdAt: -1 })
          .toArray();

        // Join petInfo into each post
        const petMap = {};
        matchingPets.forEach((pet) => {
          petMap[pet._id.toString()] = pet;
        });

        const result = adoptionPosts.map((post) => ({
          ...post,
          petInfo: petMap[post.petId],
        }));

        res.status(200).json(result);
      } catch (error) {
        console.error("Failed to fetch adoption posts:", error);
        res.status(500).json({ error: "Failed to fetch adoption posts" });
      }
    });

    app.post("/adoptionPosts", async (req, res) => {
      try {
        const adoptionPost = req.body;
        const result = await adoptionPostsCollection.insertOne(adoptionPost);
        res.send(result);
      } catch (error) {
        console.error("Error creating adoption post:", error);
        res.status(500).json({ error: "Failed to create adoption post" });
      }
    });

    // favourites

    app.get("/favorites/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const favorites = await favoritesCollection.find({ userId }).toArray();

        // Return only postIds or full post data if you prefer
        res.status(200).json(favorites.map((fav) => fav.postId));
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.post("/favorites", async (req, res) => {
      try {
        const { userId, postId } = req.body;

        // Validate input
        if (!userId || !postId) {
          return res
            .status(400)
            .json({ error: "userId and postId are required" });
        }

        // Check if already favorited
        const existing = await favoritesCollection.findOne({ userId, postId });
        if (existing) {
          return res.status(400).json({ error: "Already in favorites" });
        }

        await favoritesCollection.insertOne({
          userId,
          postId,
          createdAt: new Date(),
        });

        res.status(201).json({ message: "Added to favorites" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.delete("/favorites", async (req, res) => {
      try {
        const { userId, postId } = req.body;

        if (!userId || !postId) {
          return res
            .status(400)
            .json({ error: "userId and postId are required" });
        }

        const result = await favoritesCollection.deleteOne({ userId, postId });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Favorite not found" });
        }

        res.status(200).json({ message: "Removed from favorites" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
    });

    // adoption requests
    // GET /adoption-requests/:email ->owner
    app.get("/adoption-requests/:email", async (req, res) => {
      const email = req.params.email;
      const requests = await adoptionRequestsCollection
        .find({ ownerEmail: email })
        .toArray();
      res.send(requests);
    });

    // GET /my-adoption-requests/:email ->current user
    // GET /my-adoption-requests/:email
    app.get("/my-adoption-requests/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const requests = await adoptionRequestsCollection
          .find({ "requestedBy.email": email }) // <-- nested field match
          .toArray();
        res.send(requests);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch requests", error });
      }
    });

    //post//adoption-requests
    app.post("/adoption-requests", async (req, res) => {
      const request = req.body;
      request.status = "pending";
      request.requestedAt = new Date();

      const result = await adoptionRequestsCollection.insertOne(request);
      res.send(result);
    });

    // PATCH /adoption-requests/:id/status
    // Body: { status: "accepted" | "rejected" }
    app.patch("/adoption-requests/:id/status", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      try {
        const result = await adoptionRequestsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: { status },
          }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to update request status" });
      }
    });

    // products
    // POST /products

    app.get("/products", async (req, res) => {
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
    });

    app.post("/products", async (req, res) => {
      try {
        const product = req.body;
        product.createdAt = new Date(); // optional timestamp
        const result = await productsCollection.insertOne(product);
        res.send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Product upload error:", error);
        res.status(500).send({ error: "Failed to upload product" });
      }
    });

    // orders

    // Backend: Get paid orders (for specific user or all users if no email provided)
    app.get("/orders", async (req, res) => {
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
    });

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ordersCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
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
    });

    app.patch("/orders/paid/:id", async (req, res) => {
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
    });

    // Update delivery status
    app.patch("/orders/:id", async (req, res) => {
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
    });

    // cart
    // Get all unpaid orders for a specific user
    app.get("/cart", async (req, res) => {
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
    });

    // coupons
    app.get("/coupons/:code", async (req, res) => {
      const code = req.params.code;
      const today = new Date();

      const coupon = await db.collection("coupons").findOne({
        code,
        expireDate: { $gte: today },
      });

      if (!coupon) {
        return res
          .status(404)
          .send({ valid: false, message: "Invalid or expired coupon" });
      }

      res.send({ valid: true, discount: coupon.discount });
    });

    // payment

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = Math.round(price * 100); // in cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    });

    // coupons

    // Backend API: Validate a coupon by code
    app.get("/validate-coupon/:code", async (req, res) => {
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
    });

    app.get("/coupons", async (req, res) => {
      const coupons = await couponsCollection
        .find()
        .sort({ expireDate: -1 })
        .toArray();
      res.send(coupons);
    });

    app.post("/coupons", async (req, res) => {
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
    });

    app.patch("/coupons/:id", async (req, res) => {
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
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
