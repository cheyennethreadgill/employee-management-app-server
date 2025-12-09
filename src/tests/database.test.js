const mysql = require("mysql");

describe("Database", () => {
  function initializeAuth() {
    return mysql.createConnection({
      user: process.env.MYSQL_ROOT,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
  }

  // initialize authorization
  const database = initializeAuth();

  // return connection state
  const dbConnection = new Promise((resolve, reject) => {
    database.connect((err) => {
      if (err) {
        console.log(`DB TEST CONNECTION ERROR: ${err}`);
      } else {
        expect(database.state).toBe("connected");
      }
    });
    resolve(console.log("Database connected..."));
  });

  // close database connection after each test
  afterAll(() => {
    dbConnection.finally(() => {
      database.end();
      console.log("Database connection ended.");
    });
  });
  // -------------------------------------------------before each end

  it( "tests real DB connection", async () => {
    
  });

  // it("tests get all employees from db", () => {
  //   // create dummy data
  //   console.log("first test working");
  // });
});
// ---------describe end
