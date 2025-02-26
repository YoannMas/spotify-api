import express, { Request, Response } from "express";
import authenticate from "../middlewares/authenticate";
import axios from "axios";

const router = express.Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${req.session?.accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send("Failed to fetch user profile");
  }
});

export default router;
