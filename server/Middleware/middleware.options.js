import passport from "passport";
import strategy from "passport-local";
import multer from "multer";
import UserLoginModel from "../Models/user.login.model.js";

const LocalStrategy = strategy.Strategy;

// ****DONT USE FOR REACT, USE JWT
// Using passport, Find and compare password to DB
// passport.use(
//   // tells password to look inside the body for the email in req body
//   new LocalStrategy({ usernameField: "username", passReqToCallback: true }, async (req, username, password, done) => {
//     try {
//       // find the document, the document properties is now avalible to this function
//       const user = await UserLoginModel.findOne({ username: username }).exec();

//       // return error message if user cant be found
//       if (!user) {
//         return done(null, false, { message: "Invalid Username or password" });
//       }
//       // compare the password using comparePassword function
//       const passwordOk = await user.comparePassword(req.body.password);

//       if (!passwordOk) {
//         return done(null, false, { message: "Invalid Username or password" });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   })
// );
// passport.serializeUser((user, done) => {
//   return done(null, user._id);
// });
// passport.deserializeUser(async (id, done) => {
//   try {
//     // load user
//     const user = await UserLoginModel.findById(id);
//     return done(null, user);
//   } catch (err) {
//     return done(null, user._id);
//   }
//   return passport;
// });
// export const passportMware = {
//   initialize: passport.initialize(),
//   session: passport.session(),
//   setLocalUser: (req, res, next) => {
//     req.locals = req.user;
//     return next();
//   },
// };

// export const sessionOptions = {
//   secret: "secret signature",
//   resave: true,
//   saveUninitialized: true,
// };

