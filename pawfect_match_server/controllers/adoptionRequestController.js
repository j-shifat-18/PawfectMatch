const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const adoptionRequestsCollection = client.db("pawfect_match").collection("adoption-requests");

// Get adoption requests by owner email
const getAdoptionRequestsByOwner = async (req, res) => {
  const email = req.params.email;
  const requests = await adoptionRequestsCollection
    .find({ ownerEmail: email })
    .toArray();
  res.send(requests);
};

// Get adoption requests by requester email
const getMyAdoptionRequests = async (req, res) => {
  const email = req.params.email;
  try {
    const requests = await adoptionRequestsCollection
      .find({ "requestedBy.email": email }) // <-- nested field match
      .toArray();
    res.send(requests);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch requests", error });
  }
};

// Create adoption request
const createAdoptionRequest = async (req, res) => {
  const request = req.body;
  request.status = "pending";
  request.requestedAt = new Date();

  const result = await adoptionRequestsCollection.insertOne(request);
  res.send(result);
};

// Update adoption request status
const updateAdoptionRequestStatus = async (req, res) => {
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
};

module.exports = {
  getAdoptionRequestsByOwner,
  getMyAdoptionRequests,
  createAdoptionRequest,
  updateAdoptionRequestStatus,
}; 