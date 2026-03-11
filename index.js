require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 3002;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  "";

async function start() {
  if (!MONGODB_URI) {
    console.error("❌ Falta a variável MONGODB_URI no .env");
    console.error("   Exemplo: MONGODB_URI=mongodb+srv://USER:PASS@cluster...");
    process.exit(1);
  }

  try {
    // garante ligação inicializada só uma vez
    if (mongoose.connection.readyState === 0) {
      mongoose.set("strictQuery", true);
      await mongoose.connect(MONGODB_URI, {
        family: 4,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
    }

    console.log("✅ MongoDB ligado");

    app.listen(PORT, () => {
      console.log(`🚀 API a correr em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro a ligar ao MongoDB:");
    console.error(err?.message || err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

start();