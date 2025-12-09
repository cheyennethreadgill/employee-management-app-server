import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

// configure .ENV file
dotenv.config();

export const URI = process.env.MONGODB_URI;
const DBNAME = process.env.MONGODB_DBNAME;

// set up new client
// const client = new MongoClient(URI);
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db(DBNAME).command({ ping: 1 });
    console.log(
      "***************************************************Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// connect to database
// export const database = client.db(DBNAME);

// make a query from employees that shows all employees
// export const employees = database.collection("employees");
// export const projects = database.collection("projects");
// export const users = database.collection("users");
// export const sessions = database.collection("sessions");

console.log("server working");

// const foundEmployee = await employees.findOne({ fname: "test" });
// console.log(foundEmployee);

// export { URI, database, employees, projects, users, sessions };
