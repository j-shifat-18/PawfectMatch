import Dexie from "dexie";

const db = new Dexie("PawfectMatchDB");

db.version(1).stores({
  adoptionPosts: "++id, _id, name",
  pendingPets: "++id, createdAt" // Auto-increment ID and timestamp
});

export default db;
