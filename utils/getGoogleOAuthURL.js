import { oauthClient } from "./oauth.client.js";

export const getGoogleOAuthURL = () => {
  //define scopes we are trying to access from google
  const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"];

  // return generated url to client (using googleOAuthUrlHandler req handler) from oauthClient with defined options
  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
};
