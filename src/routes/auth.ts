import express, { Request, Response } from "express";
import axios from "axios";
import { RequestWithTokenInfo } from "../request.types";

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

    // Store tokens in session
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.expiresAt = Date.now() + expires_in * 1000;

    res.redirect("/api/user");
  } catch (error: any) {
    console.error("Error exchanging tokens:", error.message);
    res.status(500).send("Failed to exchange tokens");
  }
});

export default router;
