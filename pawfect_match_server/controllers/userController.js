const { client } = require("../config/db");

const usersCollection = client.db("pawfect_match").collection("users");

// Get users with optional filtering
const getUsers = async (req, res) => {
  const { email, role, search } = req.query;

  const filter = {};
  if (email) filter.email = email;
  if (role) filter.role = role;
  
  // Add search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const users = await usersCollection.find(filter).toArray();
    // If specific email is queried and only one result is expected
    if (email && !role && !search) {
      return res.send(users[0] || null);
    }
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch users" });
  }
};

// Create new user
const createUser = async (req, res) => {
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
};

// Update user by email
const updateUser = async (req, res) => {
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
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
}; 