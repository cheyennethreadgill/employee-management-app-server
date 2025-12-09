import { Router } from "express";
import { projects } from "../database.js";

const projectRouter = new Router();

export const getProjectsRouter = projectRouter.get("/", async (req, res, next) => {
  try {
    let foundArray = [];
    const allProjectsFound = projects.find();

    for await (const doc of allProjectsFound) {
      foundArray.push(doc);
    }
    res.json(foundArray);
  } catch (err) {
    console.log(`error getting projects: ${err}`);
    next(err);
  } finally {
    console.log("Get projects action complete.");
    res.end();
  }
});

export const addProjectsRouter = projectRouter.post("/", async (req, res) => {
  console.log(req.body);

  let projectInfo = {
    title: req.body.title,
    projectID: req.body.projectID,
    department: req.body.department,
    priority: req.body.priority,
    client: req.body.client,
    price: req.body.price,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    team: req.body.team,
    status: req.body.status,
    description: req.body.description,
  };

  let idLength = projectInfo.projectID.length > 4;

  // check id length send 500 error if length check failed
  if (idLength) {
    res.json({ message: "Form Error: Project ID must be 4 characters." });
  } else {
    try {
      await projects.insertOne(projectInfo);

      res.json({
        status: "success",
        message: "project added successfully.",
        project: req.body,
      });
    } catch (err) {
      console.log(`error adding project: ${err}`);
      next(err);
    } finally {
      console.log("User project action complete.");
      res.end();
    }
  }
});

export const updateProjectsRouter = projectRouter.put("/", async (req, res) => {
  console.log(req.body);

  let filterProject = {
    projectID: req.body.projectID,
  };

  let projectInfo = {
    $set: {
      title: req.body.title,
      projectID: req.body.projectID,
      department: req.body.department,
      priority: req.body.priority,
      client: req.body.client,
      price: req.body.price,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      team: req.body.team,
      status: req.body.status,
      description: req.body.description,
    },
  };

  try {
    await projects.updateOne(filterProject, projectInfo);

    res.json({
      status: "success",
      message: "project updated successfully.",
      projectUpdated: req.body,
    });
  } catch (err) {
    console.log(`error updating project: ${err}`);
    next(err);
  } finally {
    console.log("User project update complete.");
    res.end();
  }
});
