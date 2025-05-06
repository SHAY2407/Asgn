const mongoose = require("mongoose");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

// Socket.io server setup
const io = new Server(3002, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Connect to the MongoDB replica set
mongoose
  .connect(
    "mongodb://127.0.0.1:2747/education?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB replica set for change stream.");
    startChangeStream();
  })
  .catch((err) => {
    console.error("Connection error for change stream:", err);
  });

function startChangeStream() {
  const db = mongoose.connection.db;
  const collection = db.collection("scheduled_assignments");

  // Set up Socket.io connection handler
  io.on("connection", async (socket) => {
    console.log("Client connected to socket");
    
    // Handle request for initial assignments
    socket.on("getInitialAssignments", async () => {
      try {
        // Get all documents from the collection
        const assignments = await collection.find({}).toArray();
        console.log(`Sending ${assignments.length} initial assignments to client`);
        socket.emit("initialAssignments", assignments);
      } catch (error) {
        console.error("Error fetching initial assignments:", error);
        socket.emit("initialAssignments", []);
      }
    });
  });

  const changeStream = collection.watch([
    { $match: { operationType: "insert" } },
  ]);

  console.log("Listening for new documents in scheduled_assignments collection...");

  changeStream.on("change", (change) => {
    const newDocument = change.fullDocument;

    // Create the event object for FullCalendar
    const event = {
      title: newDocument.title,
      start: formatDate(newDocument.start_date), // Format start date
      end: calculateEndDate(newDocument.start_date, newDocument.predicted_days),
    };

    console.log("Emitting new event:", event);

    // Emit the event to connected clients via Socket.io
    io.emit("newEvent", event);

    // Update the events.json file
    updateEventsJson(event);
  });

  changeStream.on("error", (error) => {
    console.error("Change stream error:", error);
  });
}

// Helper function to format date as YYYY-MM-DD
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

// Helper function to calculate end date based on start date and predicted days
function calculateEndDate(startDate, predictedDays) {
  const start = new Date(startDate);
  start.setDate(start.getDate() + Math.ceil(predictedDays)); // Add predicted days
  return start.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

// Helper function to update events.json
function updateEventsJson(event) {
  const eventsFilePath = path.join(__dirname, "../client/public/events.json");

  // Read the current events from the file
  fs.readFile(eventsFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading events.json:", err);
      return;
    }

    let events = [];
    try {
      events = JSON.parse(data); // Parse the existing events
    } catch (parseError) {
      console.error("Error parsing events.json:", parseError);
    }

    // Add the new event to the list
    events.push(event);

    // Write the updated events back to the file
    fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to events.json:", writeErr);
      } else {
        console.log("Successfully updated events.json with new event.");
      }
    });
  });
}