import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    accessToken: string;
    expiresAt: number;
    refreshToken: string;
  }
}
