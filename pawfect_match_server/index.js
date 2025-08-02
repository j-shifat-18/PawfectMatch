require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Import database connection
const { connectDB } = require("./config/db");

// Import middleware
const { verifyFBToken } = require("./middlewares/authMiddleware");

// Import routes
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const adoptionRequestRoutes = require("./routes/adoptionRequestRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const cartRoutes = require("./routes/cartRoutes");
const chatRoutes = require("./routes/chatRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { validateCoupon } = require("./controllers/couponController");
const { createAdoptionPost } = require("./controllers/adoptionController");
const { getMyAdoptionRequests } = require("./controllers/adoptionRequestController");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // using cookies/auth headers
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Make io available to controllers
app.set('io', io);

// Connect to database
connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(port, () => {
      console.log(`Server with Socket.IO listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

// Routes
app.use("/users", userRoutes);
app.use("/pets", petRoutes);
app.use("/adoption-posts", adoptionRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/adoption-requests", adoptionRequestRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/coupons", couponRoutes);
app.use("/cart", cartRoutes);
app.use("/chat", chatRoutes);
app.use("/ai", aiRoutes);

// Legacy coupon validation route for backward compatibility
app.get("/validate-coupon/:code", validateCoupon);

app.get("/my-adoption-requests/:email", getMyAdoptionRequests);


// Legacy adoption post route for backward compatibility
app.post("/adoptionPosts", createAdoptionPost);

// Payment intent creation
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

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log('New socket connection:', socket.id);
  
  // Join a room for the user's email
  socket.on("join", (email) => {
    console.log('User joining room:', email);
    socket.join(email);
  });

  // Handle sending a message
  socket.on("send_message", (data) => {
    console.log('Received send_message event:', data);
    // data: { fromEmail, toEmail, content, createdAt, read }
    io.to(data.toEmail).emit("receive_message", data);
  });
});
