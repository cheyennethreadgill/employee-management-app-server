import { Router } from "express";
import { users } from "../database.js";

const userRouter = new Router();

export const findUserRoute = userRouter.get("/", async (req, res, next) => {
  const reqName = req.body.username;

  try {
    const foundUser = await users.findOne({ username: reqName });

    if (!foundUser) {
      res.send("user not found.");
    } else {
      res.json({
        status: `success: ${res.statusCode}`,
        foundUser: foundUser,
      });
    }
  } catch (err) {
    console.log(`error finding user: ${err}`);
    next(err);
  } finally {
    console.log("user find action complete.");
    res.end();
  }
});

export const deleteUserRoute = userRouter.get("/", async (req, res, next) => {
  const reqName = req.body.username;

  try {
    const foundUser = await users.findOne({ username: reqName });

    if (!foundUser) {
      res.send("user not found.");
    } else {
      res.json({
        status: `success: ${res.statusCode}`,
        foundUser: foundUser,
      });
    }
  } catch (err) {
    console.log(`error finding user: ${err}`);
    next(err);
  } finally {
    console.log("user find action complete.");
    res.end();
  }
});
