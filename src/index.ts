import dotenv from "dotenv";
import express, { Application } from "express";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
  })
);

// Routes
app.use("/api/authenticate", authRoutes);
app.use("/api/user", userRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
