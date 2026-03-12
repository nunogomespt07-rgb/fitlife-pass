require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || "";

const connectDB = async () => {
  if (!MONGODB_URI || !MONGODB_URI.trim()) {
    console.error("❌ MONGODB_URI (or MONGO_URI / DATABASE_URL) is not set.");
    console.error("   Set it in Railway Environment Variables to your MongoDB connection string.");
    console.error("   Example: mongodb+srv://user:pass@cluster.mongodb.net/dbname");
    process.exit(1);
  }
  const uri = MONGODB_URI.trim();
  if (process.env.NODE_ENV === "production" && (/127\.0\.0\.1|localhost(?::27017)?(\/|$)/i.test(uri))) {
    console.error("❌ MONGODB_URI must not point to localhost in production.");
    console.error("   Use a cloud MongoDB (e.g. MongoDB Atlas) and set MONGODB_URI in Railway.");
    process.exit(1);
  }
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

start();