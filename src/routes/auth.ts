import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

// Step 1: Redirect to Spotify Authorization Page
router.get("/", (req: Request, res: Response) => {
  const scopes = "user-read-private user-read-email";
  const redirectUri =
    `https://accounts.spotify.com/authorize?` +
    `response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&` +
    `scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
      process.env.SPOTIFY_REDIRECT_URI ?? ""
    )}`;

  res.redirect(redirectUri);
});

// Step 2: Handle Callback and Exchange Code for Access Token
router.get("/callback", async (req: Request, res: Response): Promise<any> => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code is missing");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Return tokens to frontend or store them securely
    res.json({ access_token, refresh_token, expires_in });
  } catch (error: any) {
    console.error(
      "Error fetching tokens:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to fetch access token");
  }
});

// Step 3: Handle Refresh Token and Provide New Access Token
router.post("/refresh", async (req: Request, res: Response): Promise<any> => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).send("Refresh token is missing");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        params: {
          grant_type: "refresh_token",
          refresh_token,
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Return new access token and expiration time to the frontend
    res.json({ access_token, expires_in });
  } catch (error: any) {
    console.error(
      "Error refreshing access token:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to refresh access token");
  }
});

export default router;
