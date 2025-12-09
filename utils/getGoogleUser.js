import { oauthClient } from "./oauth.client.js";

import axios from "axios";

// make request to google to load user data after granted permission
// return url to make a request to to load the user data from url

//load info using code sent to this fn
export const getGoogleUser = async ({ code }) => {
  // get tokens from oauthclient when /google/callback is triggered with oauthclient
  const { tokens } = await oauthClient.getToken(code);

  const options = {
    method: "GET",
    // set authorization header with project setup (grants us access to get userinfo)...
    headers: { Authorization: `Bearer ${tokens.id_token}` },
  };

  // ...set the acces token with the token form oauth getToken
  const response = await axios(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
    options
  );

  // returns user data from google
  return response.data;
};
