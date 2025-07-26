require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");

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

    // pets

    // get all pets for a user
    app.get("/pets", async (req, res) => {
      try {
        const { ownerId } = req.query;
        const pets = await petsCollection.find({ ownerId }).toArray();
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
