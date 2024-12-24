import dotenv from "dotenv";
import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/authenticate", authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
