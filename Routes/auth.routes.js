import express from "express";
import {
  signUpHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutHandler,
  googleOAuthUrlHandler,
  googleOAuthCallbackHandler,
} from "../Auth Handlers/auth.handlers.js";

const authRouter = express.Router();

authRouter.post("/sign-up", signUpHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.put("/forgot-password/:email", forgotPasswordHandler);
authRouter.put("/reset-password/:passwordResetCode", resetPasswordHandler);
authRouter.get("/google/url", googleOAuthUrlHandler);
authRouter.get("/google/callback", googleOAuthCallbackHandler);

export default authRouter;
