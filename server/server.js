import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import authRouter from "./Routes/auth.routes.js";
import { getProjectsRouter, addProjectsRouter, updateProjectsRouter } from "./Routes/project.routes.js";
import { employeeRouter } from "./Routes/employee.routes.js";

import multer from "multer";

const app = express();
const PORT = process.env.PORT || 8080;

// upload to multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
});
// Configure AWS SDK with environment variables

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};
// middleware used for entire application
app.use(cors(corsOptions));

//requests handled already at app level

app.use(
  bodyParser.json({
    limit: 10000000,
  })
);

app.use(bodyParser.urlencoded({ extended: true, limit: 10000000 }));

app.use(upload.single("image"));

// all requests to sign up and login with be router using router in auth.routes
app.use("/auth", authRouter);

app.use("/admin", employeeRouter);

app.use("/add-project", addProjectsRouter);
app.use("/all-projects", getProjectsRouter);
app.use("/update-project", updateProjectsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port 8080... 
   --------------------------------------------------------------------`);
});
