const admin = require("../config/firebase");

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

module.exports = { verifyFBToken }; 