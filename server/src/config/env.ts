import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const env = process.env.NODE_ENV || "development";
const isDevelopment = env === "development";

export default {
  env,
  isDevelopment,
  port: parseInt(process.env.PORT || "5000", 10),
  mongoose: {
    url: process.env.MONGO_URI + (isDevelopment ? "" : "-production"),
    options: {
      autoIndex: true,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_default_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "90", 10),
  },
  clientUrl: process.env.CLIENT_URL || "*",
};
