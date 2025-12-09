import { Router } from "express";
import { employees, users } from "../database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import aws from "aws-sdk";

export const employeeRouter = new Router();

// // Create S3 instance
// const s3 = new aws.S3();

// // Configure AWS SDK
// aws.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

employeeRouter.get("/employees", async (req, res, next) => {
  try {
    let foundArray = [];
    const allEmployeesFound = employees.find();

    for await (const doc of allEmployeesFound) {
      foundArray.push(doc);
    }
    res.json(foundArray);
  } catch (err) {
    console.log(`************error getting employees in employee route: ${err}`);
    next(err);
  }
});

employeeRouter.get("/find-employee", async (req, res, next) => {
  const reqName = req.body.fname;

  try {
    const foundEmployee = await employees.findOne({ fname: reqName });

    if (!foundEmployee) {
      res.send("user not found.");
    } else {
      res.json({
        status: `success: ${res.statusCode}`,
        foundEmployee: foundEmployee,
      });
    }
  } catch (err) {
    console.log(`error finding user: ${err}`);
    next(err);
  }
});

employeeRouter.put("/update-employee/:id", async (req, res, next) => {
  const { authorization } = req.headers;
  const { id } = req.params;

  let reqImg = req.body.image || req.file.originalname;
  console.log(reqImg);

  let employeeInfoIntital = {
    email: req.body.email,
  };

  let employeeInfoUpdated = {
    $set: {
      fname: req.body.fname,
      lname: req.body.lname,
      degree: req.body.degree,
      mobile: req.body.mobile,
      designation: req.body.designation,
      department: req.body.department,
      email: req.body.email,
      image: reqImg,
    },
  };

  if (!authorization) {
    console.log("NOT AUTHORIZED");
    res.status(401).json({ message: "You don't have acces to change this resource.", auth: authorization });
  }
  // get payload from auth token sent from client
  const token = authorization.split(" ")[1];

  // verify the payload from client
  jwt.verify(token, "nkjsd;s5s68edsfdgdg8ds56r54KJhHGTFFYHTFYULHJDIUHSD", async (err, decoded) => {
    if (err) {
      return res.status(409).json({ message: "Error with JWT verification" });
    }

    // if email sent from client doesnt equal the id that they want to update
    if (id !== decoded.id) {
      return res.status(409).json({ message: "You do not have access to change this resource." });
    }

    // update the emloyee
    if (req.file) {
      //SET REQ FILE FOR ABOVE
      reqImg = req.file.originalname;

      // SERVER HANDLE FILE CHECK
      let index = reqImg.lastIndexOf(".");
      let extension = reqImg.substring(-1 + index + 1);

      if (extension !== ".png" && extension !== ".jpeg" && extension !== ".jpg") {
        //if file exists and extension is wrong
        console.log(`*****************Please give valid extension. File entered: ${extension}`);
        return res.status(500).json({ message: `Please give valid extension: ${extension}` });
      }

      try {
        // Generate a unique key based on the file's original name
        function generateKey() {
          const origname = req.file.originalname;
          return `${origname}`;
        }
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: generateKey(), // Leave it empty for now
          Body: req.file.buffer,
        };

        // Upload file to S3
        s3.upload(uploadParams, (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "**************Failed to upload file to S3" });
          }
          console.log({ url: data.Location });
          // File uploaded successfully, return URL or other relevant info
        });
        // ***********************************************s3 end
        await employees.updateOne(employeeInfoIntital, employeeInfoUpdated);
        const foundUser = await employees.findOne({ email: req.body.email });

        const { _id, fname, lname, username, email, password, image } = foundUser;
        // get the data from db
        // create web token
        jwt.sign(
          { id: _id, fname, lname, username, email, password, image: image },
          process.env.JWT_SECRET,
          { expiresIn: "2d" },
          function (err, token) {
            if (err) {
              return res.status(401).json("Unauthorized access.");
            }
            // send token to front end
            return res.status(200).json({ message: "Employee Updated!", token });
          }
        );
      } catch (err) {
        console.log(`error update employee: ${err}`);
        return res.sendStatus(500);
      }
    } else {
      try {
        employees.updateOne(employeeInfoIntital, employeeInfoUpdated);

        const foundUser = await employees.findOne({ email: req.body.email });

        const { _id, fname, lname, username, email, password, image } = foundUser;

        // get the data from db
        // create web token
        jwt.sign(
          { id: _id, fname, lname, username, email, password, image },
          process.env.JWT_SECRET,
          { expiresIn: "2d" },
          function (err, token) {
            if (err) {
              return res.status(401).json("Unauthorized access.");
            } else {
              // send token to front end
              return res.status(200).json({ token });
            }
          }
        );
      } catch (err) {
        console.log(`error update employee: ${err}`);
        return res.sendStatus(500).json({ message: err });
      }
    }
  });

  // update the user token when image is uploaded to server
  // set token in employee modal with new token sent from server response on PUT
});

employeeRouter.post("/add-employee", async (req, res, next) => {
  // if req file isnt present, continue with query
  // if req file is present want to send error if req file is uploaded, else continue with query

  const generateHashPassword = async () => {
    return bcrypt.hash(req.body.password, 10);
  };

  let employeeInfo = {
    fname: req.body.fname,
    lname: req.body.lname,
    mobile: req.body.mobile,
    designation: req.body.designation,
    department: req.body.department,
    email: req.body.email,
    degree: req.body.degree,
    image: (req.file && req.file.originalname) || " ",
    username: req.body.username,
    password: await generateHashPassword(),
  };

  if (req.file) {
    //SET REQ FILE FOR ABOVE
    employeeInfo.image = req.file.originalname;

    // SERVER HANDLE FILE CHECK
    let index = employeeInfo.image.lastIndexOf(".");
    let extension = employeeInfo.image.substring(-1 + index + 1);

    if (extension !== ".png" && extension !== ".jpeg" && extension !== ".jpg") {
      //if file exists and extension is wrong
      console.log(`*****************Please give valid extension. File entered: ${extension}`);
      return res.status(500).json({ error: `Please give valid extension: ${extension}` });
    }

    try {
      // Generate a unique key based on the file's original name
      function generateKey() {
        const origname = req.file.originalname;
        return `${origname}`;
      }
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: generateKey(), // Leave it empty for now
        Body: req.file.buffer,
      };

      // Upload file to S3
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "**************Failed to upload file to S3" });
        }
        // File uploaded successfully, return URL or other relevant info
        console.log({ url: data.Location });
      });
      // ***********************************************s3 end
      await employees.insertOne(employeeInfo);
      const addedEmployee = await employees.findOne({ email: req.body.email });

      const { _id, fname, lname, username, email, password, image } = addedEmployee;

      // create web token
      jwt.sign(
        { id: _id, fname, lname, username, email, password, image: image, isVerified: false },
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

      console.log(`IMAGE UPLOADED (req file else conditional): ${employeeInfo.image}`);
      console.log(req.file);
      console.log({ body: req.body });

      return res.json({
        status: "success",
        message: "Employee added successfully.",
        employee: req.body,
      });
    } catch (err) {
      console.log(`error adding employee: ${err}`);
      return next(err);
    }
  } else {
    try {
      await employees.insertOne(employeeInfo);
      const addedEmployee = await employees.findOne({ email: req.body.email });
      const { _id, fname, lname, username, email, password, image } = addedEmployee;

      // create web token
      jwt.sign(
        { id: _id, fname, lname, username, email, password, image: image, isVerified: false },
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

      return res.json({
        status: res.statusCode,
        message: "Employee added successfully.",
        employee: req.body,
      });
    } catch (err) {
      console.log(`error adding employee: ${err}`);
      return next(err);
    }
  }
});

employeeRouter.delete("/delete-employee/:email", async (req, res) => {
  try {
    let vals = req.params.email;
    console.log(vals);
    await employees.deleteOne({ email: vals });
    await users.deleteOne({ email: vals });
  } catch (err) {
    res.json({ message: err });
  }
});
