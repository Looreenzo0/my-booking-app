import app from "./app";
import dotenv from "dotenv";
import config from "./config/env";
import connectDB from "./config/db";

dotenv.config();

const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
