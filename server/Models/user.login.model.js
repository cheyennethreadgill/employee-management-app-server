import mongoose from "mongoose";
// import emailValidator from "email-validator";
import bcrypt from "bcrypt";

const options = {
  dbName: "Kuber_Employee_Management_DB",
};
const URL =
  "mongodb+srv://employeemanagement_user:cetH0996*@cluster0.ks4sqxb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(URL, options);

const saltRounds = 10;

const UserLoginSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
  lname: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    // validate: {
    //   validator: emailValidator.validate,
    // },
    lowercase: true,
  },
  password: {
    type: String,
    minLength: 8,
  },
  image: {
    type: String,
  },
});

// before each mongoose save,
UserLoginSchema.pre("save", async function preSave(next) {
  const thisUser = this;
  //  check to see if password was modified
  if (!thisUser.isModified("password")) return next();

  try {
    const generateHashPassword = async () => {
      return bcrypt.hash(thisUser.password, saltRounds);
    };

    thisUser.password = await generateHashPassword();
    console.log(`password in model: ${thisUser.password}`);
    return next();
  } catch (err) {
    return next(err);
  }
});

// attatches bcrypt compare method to each user model
UserLoginSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// creates userLogin Model
export default mongoose.model("employees", UserLoginSchema);
