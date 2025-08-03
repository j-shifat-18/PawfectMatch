require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Import database connection
const { connectDB, client } = require("./config/db");

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
const swipeCardsRoutes = require("./routes/swipeCardsRoutes");
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
app.use("/swipecards", swipeCardsRoutes);

// Test endpoint to verify server is running
app.get("/test-swipe", (req, res) => {
  res.json({ message: "Swipe cards server is running" });
});

// Debug endpoint to check favorites
app.get("/debug-favorites", async (req, res) => {
  try {
    const favorites = await client.db("pawfect_match").collection("favourites").find({}).toArray();
    res.json({ 
      message: "Favorites collection contents", 
      count: favorites.length,
      favorites: favorites.slice(0, 5) // Show first 5
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Test AI routes endpoint
app.get("/test-ai-routes", (req, res) => {
  res.json({ 
    message: "AI routes are working",
    availableEndpoints: [
      "POST /ai/auto-detect-pet",
      "GET /ai/matches"
    ]
  });
});

// Debug endpoint to check all routes
app.get("/debug-routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

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


const paymentsCollection = client.db("pawfect_match").collection("payments");

app.get('/payments' , async(req , res)=>{
  const result = await paymentsCollection.find().toArray();
  res.send(result);
})

app.post('/payments', async (req, res) => {
  try {
    const db = req.app.locals.db; // Get db from app.locals
    const paymentData = req.body;

    // Validate required fields
    const requiredFields = [
      'orderId',
      'buyerEmail',
      'productId',
      'productName',
      'productImage',
      'price',
      'finalPrice',
      'transactionId',
      'order_date',
    ];

    for (let field of requiredFields) {
      if (!paymentData[field]) {
        return res.status(400).json({ message: `Missing field: ${field}` });
      }
    }

    // Set default fields if not provided
    paymentData.payment_status = paymentData.payment_status || 'paid';
    paymentData.delivery_status = paymentData.delivery_status || 'pending';
    paymentData.payment_date = new Date();

    const result = await paymentsCollection.insertOne(paymentData);

    res.status(201).json({
      message: 'Payment saved successfully',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ message: 'Failed to save payment data' });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "Server is running"
  });
});

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// const http = require("http");
// const { Server } = require("socket.io");
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//   },
// });

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
