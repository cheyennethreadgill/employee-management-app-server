const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const aws = require("aws-sdk");
const database = require("./database");

const app = express();
const PORT = process.env.PORT || 8080;

// Configure AWS SDK with environment variables
const s3 = new aws.S3({
accessKeyId: process.env.AWS_ACCESS_KEY_ID,
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
region: process.env.AWS_REGION, // Specify the region where your S3 bucket is located
});

// upload to multer memory storage
const upload = multer({
storage: multer.memoryStorage(),
});

// middleware used for entire application
app.use(cors());
app.use(
bodyParser.json({
limit: 10000000,
})
);
app.use(bodyParser.urlencoded({ extended: true, limit: 10000000 }));

app.get("/find-user", async (req, res, next) => {
const reqName = req.body.name;
const users = database.collection("users");

try {
const foundUser = await users.findOne({ name: reqName });

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
app.get("/employees", (req, res) => {
(err) => {
console.log(err);
};

let sql = "SELECT \* FROM employees";

database.query(sql, (err, result) => {
if (err) {
throw err;
} else res.json(result);
});
});
app.get("/all-projects", (req, res) => {
(err) => {
console.log(err);
};

let sql = "SELECT \* FROM projects";

database.query(sql, (err, result) => {
if (err) {
throw err;
} else res.json(result);
});
});

// ****\*\*****\*\*****\*\*****\*\*****\*\*****\*\*****\*\*****ADD
// ADD EMPLOYEE
app.post("/add-employee", upload.single("image"), (req, res) => {
let fname = req.body.fname;
let lname = req.body.lname;
let gender = req.body.gender;
let mobile = req.body.mobile;
let password = req.body.password;
let designation = req.body.designation;
let department = req.body.department;
let address = req.body.address;
let email = req.body.email;
let dateofbirth = req.body.dateofbirth;
let degree = req.body.degree;
let image = (req.file && req.file.originalname) || " ";

// if req file isnt present, continue with query
// if req file is present want to send error if req file is uploaded, else continue with query

let values = [
fname,
lname,
gender,
mobile,
password,
designation,
department,
address,
email,
dateofbirth,
degree,
image,
];

let sql = `INSERT into employees (firstname, lastname, gender, mobile, password, designation, department, address, email, dateofbirth, degree, image) VALUES (?)`;
// let sql = `INSERT into employees ( image) VALUES (?)`;

if (req.file) {
//**\*\***\*\*\*\***\*\***\***\*\***\*\*\*\***\*\***if file exists
console.log(values);
console.log(`^^^^values logged inside of req.file cnditional`);

    //SET REQ FILE FOR ABOVE
    image = req.file.originalname;

    // SERVER HANDLE FILE CHECK
    let index = image.lastIndexOf(".");
    let extension = image.substring(-1 + index + 1);

    // Generate a unique key based on the file's original name
    function generateKey() {
      const origname = req.file.originalname;
      return `${origname}`;
    }
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "", // Leave it empty for now
    };
    // Set the Key property using the generated key function
    uploadParams.Key = generateKey();
    uploadParams.Body = req.file.buffer;

    // Upload file to S3
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to upload file to S3" });
      }
      // File uploaded successfully, return URL or other relevant info
      console.log({ url: data.Location });
    });

    if (extension !== ".png" && extension !== ".jpeg" && extension !== ".jpg") {
      //if file exists and extension is wrong
      res.status(500).json({ error: `Please give valid extension: ${extension}` });
      console.log(`Please give valid extension. File entered: ${extension}`);
    } else {
      database.query(sql, [values], (err) => {
        if (err) {
          throw err;
        } else {
          res.json({
            status: "success",
            message: "Employee added successfully.",
            employee: req.body,
          });
        }
      });
      console.log(` valid extension: ${extension}`);
      console.log(`IMAGE UPLOADED (req file else conditional): ${image}`);
      console.log(req.file);
      console.log({ body: req.body });
    }

} else {
//\*_WORKS _/
console.log("else ran");
// //if file exists and extension is correct

    database.query(sql, [values], (err) => {
      if (err) {
        throw err;
      } else {
        res.json({
          status: "success",
          message: "Employee added successfully.",
          employee: req.body,
        });
      }
    });

    console.log({ body: req.body });

}

// else {
// //if nothing is wrong, execute general query
// database.query(sql, [values], (err) => {
// if (err) {
// throw err;
// } else {
// res.json({
// status: "success",
// message: "Employee added successfully.",
// employee: req.body,
// });
// }
// });
// }
});

// ADD PROJECT
app.post("/add-project", (req, res) => {
console.log(req.body);
let title = req.body.title;
let projectID = req.body.projectID;
let department = req.body.department;
let priority = req.body.priority;
let client = req.body.client;
let price = req.body.price;
let startDate = req.body.startDate;
let endDate = req.body.endDate;
let team = req.body.team;
let status = req.body.status;
let description = req.body.description;

let sql = `INSERT into projects (title, projectID, department, priority, client, price, startDate, endDate, team, status, description) VALUES (?)`;
let values = [title, projectID, department, priority, client, price, startDate, endDate, team, status, description];

let idLength = projectID.length > 4;

// check id length send 500 error if length check failed
if (idLength) {
res.json({ message: "Form Error: Project ID must be 4 characters." });
} else {
database.query(sql, [values], (err) => {
if (err) {
console.log(`QUERY ERROR: ${err}`);
} else {
res.json({
status: "success",
message: "Project added successfully.",
project: req.body,
});
}
});
}
});

// **\*\*\*\***\*\*\*\***\*\*\*\***\***\*\*\*\***\*\*\*\***\*\*\*\***UPDATES
// UPDATE EMPLOYEE
app.put("/update-employee", upload.single("image"), (req, res) => {
console.log(req.body);
console.log(req.file);

let sql = `UPDATE employees SET firstname = '${req.body.fname}', degree = '${req.body.degree}', lastname = '${
    req.body.lname
  }', mobile = '${req.body.mobile}', designation = '${req.body.designation}', department = '${
    req.body.department
  }', email = '${req.body.email}', image = '${req.body.image || req.file.originalname}' WHERE employeeid = '${
    req.body.employeeid
  }'`;

// If a file is selected by client...
if (req.file) {
// Generate a unique key based on the file's original name
function generateKey() {
const origname = req.file.originalname;
return `${origname}`;
}
const uploadParams = {
Bucket: process.env.AWS_BUCKET_NAME,
Key: "", // Leave it empty for now
};
// Set the Key property using the generated key function
uploadParams.Key = generateKey();
uploadParams.Body = req.file.buffer;

    // Upload file to S3
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to upload file to S3" });
      }
      // File uploaded successfully, return URL or other relevant info
      console.log({ url: data.Location });
    });

}

database.query(sql, (err) => {
if (err) {
throw err;
} else {
res.json({
status: "success",
message: "Employee updated successfully.",
employee: req.body,
fileToMYSQL: req.file,
// s3ObjectUrl: data.Location,
});
}
});
});

app.put("/update-project", (req, res) => {
console.log(req.body);

let sql = `UPDATE projects SET title = '${req.body.title}', department = '${req.body.department}', priority = '${req.body.priority}', status = '${req.body.status}', team = '${req.body.team}', description = '${req.body.description}' WHERE projectID = '${req.body.projectID}'`;

database.query(sql, (err) => {
if (err) {
throw err;
} else {
res.json({
status: "success",
message: "Project updated successfully.",
project: req.body,
});
}
});
});
// **\*\*\*\***\*\*\*\***\*\*\*\***\***\*\*\*\***\*\*\*\***\*\*\*\***DELETE
app.delete("/delete-employee/:id", (req, res) => {
let sql = `DELETE FROM employees WHERE employeeid = (?)`;

let vals = [req.params.id];

database.query(sql, [vals], (err, res) => {
if (err) {
throw err;
}
});
res.json("Employee deleted.");
});

app.delete("/delete-project/:id", (req, res) => {
let sql = `DELETE FROM projects WHERE projectID = (?)`;

let vals = [req.params.id];

database.query(sql, [vals], (err, res) => {
if (err) {
throw err;
}
});
res.json("Project deleted.");
});

app.listen(PORT, () => {
console.log("Server running on port 8080...");
});
