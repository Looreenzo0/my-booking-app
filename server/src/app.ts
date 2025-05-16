import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import { errorHandler } from "./utils/errorHandler";

dotenv.config();

const app = express();

// CORS - configure in prod
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // use specific origin in prod
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use(errorHandler);

export default app;
