const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3030;
const { ObjectId } = require("mongodb");
const morgan = require("morgan");
app.set("json spaces", 3);

// MongoDB Connection
const uri =
  "mongodb+srv://WebstoreUser:Ifeoluwa123456%3F@webstorecluster.yr6n0av.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

client
  .connect()
  .then(() => {
    db = client.db("LectureApp");
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Middleware
app.use(cors());

app.use(morgan("short"))
app.use(bodyParser.json());
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Root Path
app.get("/", (_req, res, _next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

// Get Collection Name
app.param("collectionName", (req, _res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

// Retrieve all objects from a collection
app.get("/collections/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((err, results) => {
    if (err) return next(err);
    res.send(results);
  });
});

// Post - to save new order to collection
app.post("/collections/:collectionName", function (req, res, next) {
  req.collection.insertOne(req.body, function (err, results) {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
});

// Put - to update Course Id. 
app.put("/collections/:collectionName/:id", function (req, res, next) {
  req.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        res.send(
          result.matchedCount === 1 ? { msg: "success" } : { msg: "error" }
        );
      }
    }
  );
});

// Search. 
app.get('/collections/:collectionName/search/:searchWord', (req, res, next) => {
  const { searchWord } = req.params;

  req.collection.find({}).toArray((err, results) => {
      if (err) {
          return next(err);
      }

      const filteredList = results.filter((lesson) => {
        const subjectMatch = lesson.subject && lesson.subject.toLowerCase().includes(searchWord.toLowerCase());
        const locationMatch = lesson.location && lesson.location.toLowerCase().includes(searchWord.toLowerCase());
        return subjectMatch || locationMatch;
    });
    

      res.send(filteredList);
  });
});




// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
