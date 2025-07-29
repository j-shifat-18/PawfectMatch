const { client } = require("../config/db");

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded?.email;
    if (!email) {
      return res.status(401).send({ error: true, message: "Unauthorized" });
    }

    const usersCollection = client.db("pawfect_match").collection("users");
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

module.exports = { verifyAdmin }; 