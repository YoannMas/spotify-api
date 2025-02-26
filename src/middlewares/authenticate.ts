import axios from "axios";
import { NextFunction, Request, Response } from "express";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const session = req.session;

  if (!session?.accessToken || !session.refreshToken || !session.expiresAt) {
    return res.status(401).send("User not authenticated");
  }

  // Check if token has expired
  if (Date.now() > session.expiresAt) {
    try {
      // Refresh the access token
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
            refresh_token: session.refreshToken,
          },
        }
      );

      const { access_token: new_access_token, expires_in } = response.data;

      // Update session tokens
      req.session.accessToken = new_access_token;
      req.session.expiresAt = Date.now() + expires_in * 1000;
    } catch (error: any) {
      console.error("Failed to refresh token:", error.message);
      return res.status(500).send("Failed to refresh token");
    }
  }

  next();
};

export default authenticate;
