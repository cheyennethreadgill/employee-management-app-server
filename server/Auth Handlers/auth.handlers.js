import User from "../Models/user.login.model.js";
// import successPage from "../views/successPage.jsx";
import jwt from "jsonwebtoken";
import { employees, users } from "../database.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import sgMail from "@sendgrid/mail";
import { getGoogleOAuthURL } from "../utils/getGoogleOAuthURL.js";
import { updateOrCreateUserFromOAuth } from "../utils/updateOrCreateUserFromOAuth.js";
import { getGoogleUser } from "../utils/getGoogleUser.js";

export const signUpHandler = async (req, res) => {
  const { fname, lname, username, email, password, image } = req.body;
  try {
    const user = new User({
      fname: req.body.fname,
      lname: req.body.lname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      image: " ",
    });
    // check to see if user is already in db
    const userExists = await User.findOne({
      username: req.body.username,
    });

    if (userExists) {
      res.status(409).json({ message: "sign up function handler: Username already exists." });
    } else {
      // // *****saving user with mongoose
      const insertedUser = await user.save();

      // get the id from the inserted user after query into the database
      const { _id } = insertedUser;

      // create web token
      jwt.sign(
        { id: _id, fname, lname, username, email, password, image, isVerified: false },
        process.env.JWT_SECRET,
        { expiresIn: "2d" },
        function (err, token) {
          if (err) {
            return res.status(401).json("Unauthorized access.");
          } else {
            // send token to front end
            res.status(200).json({ token });
          }
        }
      );
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const loginHandler = async (req, res) => {
  // const { username, password } = req.body;

  let usernameBody = req.body.username;
  let passwordBody = req.body.password;

  try {
    // compare user info and db info

    // check to see if user is already in db
    const foundUser = await User.findOne({
      username: usernameBody,
    });

    if (foundUser) {
      const { _id, fname, lname, username, password, email, image } = foundUser;
      // conpmare password against db
      bcrypt.compare(passwordBody, password, (err, result) => {
        if (err) {
          res.sendStatus(409).json({ message: "*****Login encryption error." });
        }
        if (result === false) {
          res.status(401).json({
            message: "login error: Invalid credentials.",
            user: username,
          });
        } else {
          // generate token(cookie) to send to client
          jwt.sign(
            { id: _id, fname, lname, username, email, password, image: image },
            process.env.JWT_SECRET,
            { expiresIn: "1hr" },
            (err, token) => {
              if (err) {
                res.sendStatus(401).json({ message: "login error: Invalid JWT credentials." });
              }
              res.status(200).json({ token });
            }
          );
        }
      });
    } else {
      res.status(409).json({ message: "Invalid credentials." });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const forgotPasswordHandler = async (req, res) => {
  const { email } = req.params;
  console.log(req.params);

  // // generate random string to send to user
  const passwordResetCode = uuid();

  const { modifiedCount } = await employees.updateOne(
    {
      email,
    },
    { $set: { passwordResetCode } }
  );
  console.log(modifiedCount);
  if (modifiedCount > 0) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: "threadgillcheyenne@gmail.com",
        subject: "Password reset",
        text: `To reset your password, click this link: http://localhost:3000/auth/reset-password/${passwordResetCode}`,
      };
      sgMail.send(msg);
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(200);
};
export const logoutHandler = async (req, res) => {
  // const { email } = req.params;
  // console.log(req.params);
  // // // generate random string to send to user
  // const passwordResetCode = uuid();
  // const { modifiedCount } = await employees.updateOne(
  //   {
  //     email,
  //   },
  //   { $set: { passwordResetCode } }
  // );
  // console.log(modifiedCount);
  // if (modifiedCount > 0) {
  //   try {
  //     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  //     const msg = {
  //       to: email,
  //       from: "threadgillcheyenne@gmail.com",
  //       subject: "Password reset",
  //       text: `To reset your password, click this link: http://localhost:3000/auth/reset-password/${passwordResetCode}`,
  //     };
  //     sgMail.send(msg);
  //     return res.sendStatus(200);
  //   } catch (err) {
  //     return res.sendStatus(500);
  //   }
  // }
  // return res.sendStatus(200);
};

export const resetPasswordHandler = async (req, res) => {
  const { passwordResetCode } = req.params;

  // // generate random string to send to user
  const { newPassword } = req.body;

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  try {
    // find empl w. passresetcode
    const { modifiedCount } = await employees.updateOne(
      { passwordResetCode },
      {
        // set newpassword w hash
        $set: {
          password: newPasswordHash,
        },
        // remove the password reset field in DB
        $unset: { passwordResetCode: "" },
      }
    );
    console.log(modifiedCount);
    if (modifiedCount === 0) {
      return res.sendStatus(404);
    }
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
};

// get oauth url request from client when google sign in option is clicked
export const googleOAuthUrlHandler = async (req, res) => {
  // getGoogleOAuthURL util file
  const url = getGoogleOAuthURL();
  // send url to client
  res.status(200).json({ url });
};

// sends user back to after they allow google permissions
export const googleOAuthCallbackHandler = async (req, res, next) => {
  // google provides  code  in query after redirecting back to this route
  const { code } = req.query;

  // use the code from req.query to get the userinfo after access granted
  const oauthUserInfo = await getGoogleUser({ code });

  // use the info from oauthuserinfo to add to db or create
  const insertedOrUpdatedUser = await updateOrCreateUserFromOAuth(req, res, next, { oauthUserInfo });

  // get info from oauth and send to jwt sign
  const { id, verified_email, email, fname, lname } = insertedOrUpdatedUser;

  // create web token
  jwt.sign(
    { id, email, isVerified: verified_email, fname, lname },
    process.env.JWT_SECRET,
    { expiresIn: "2d" },
    function (err, token) {
      if (err) {
        return res.sendStatus(500);
      } else {
        res.redirect(`http://localhost:3000/auth/login?token=${token}`);
      }
    }
  );
};
