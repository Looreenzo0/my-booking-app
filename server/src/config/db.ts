import mongoose from "mongoose";
import config from "./env";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Terminate on connection failure
  }
};

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB runtime error:", error);
});

export default connectDB;
