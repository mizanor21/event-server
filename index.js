const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://eventDB:KGngPp1r5UgMF5qf@cluster0.disah5t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const database = client.db("EventDB");
  const eventCollections = database.collection("events");
  try {
    await client.connect();
    console.log("Database successfully connected");

    app.get("/", (req, res) => {
      res.send("Event server is running");
    });

    app.get("/events", async (req, res) => {
      const query = {};
      const cursor = eventCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventCollections.findOne(query);
      res.send(result);
    });

    app.post("/events", async (req, res) => {
      const newEvent = req.body;
      try {
        const result = await eventCollections.insertOne(newEvent);
        res.status(201).json({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Error inserting event:", error);
        res
          .status(500)
          .json({ error: "An error occurred while adding the event." });
      }
    });

    app.put("/event-edit/:id", async (req, res) => {
      const id = req.params.id;
      const updatedEvent = req.body;
      try {
        const query = { _id: new ObjectId(id) };
        const update = { $set: updatedEvent };
        const options = { upsert: true };
        const result = await eventCollections.updateOne(query, update, options);

        if (result.matchedCount === 0 && result.upsertedCount === 1) {
          res
            .status(201)
            .json({
              message: "Event created successfully",
              upsertedId: result.upsertedId,
            });
        } else if (result.matchedCount > 0) {
          res.status(200).json({ message: "Event updated successfully" });
        } else {
          res.status(404).json({ message: "Event not found" });
        }
      } catch (error) {
        console.error("Error updating event:", error);
        res
          .status(500)
          .json({ error: "An error occurred while updating the event." });
      }
    });

    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await eventCollections.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Event deleted successfully" });
        } else {
          res.status(404).json({ message: "Event not found" });
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        res
          .status(500)
          .json({ error: "An error occurred while deleting the event." });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
