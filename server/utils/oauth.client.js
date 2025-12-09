import { google } from "googleapis";

// setup googleapi with credentials from google cloud

// request url is triggered when oauthclient is called
// used to connect to project
export const oauthClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8080/auth/google/callback"
);
