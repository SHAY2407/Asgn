const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors"); // Import CORS
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const TeachersModel = require('./models/Teachers');
const StudentsModel = require('./models/Students');
const AssignmentsModel = require('./models/Assignments'); // Import the AssignmentsModel
require('./changeStream.js');

// Create uploads folder if it doesn't exist
const uploadDirectory = './uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const app = express();
app.use(express.json());

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Replace with the frontend's URL and port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies, authorization headers, etc.
}));

// Connect to MongoDB
// Connect to MongoDB replica set
//mongoose.connect("mongodb://127.0.0.1:27017/education", {
mongoose.connect("mongodb://127.0.0.1:2747/education?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to MongoDB replica set.");

  // Add a route to list collections
  app.get('/collections', async (req, res) => {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      res.json(collections);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
})
.catch(err => {
  console.error("Connection error:", err);
});


// Multer storage configuration for saving PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Save PDFs in the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
}).single('pdf'); // 'pdf' is the field name used to upload the file

// Login route
app.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const Model = role === 'teacher' ? TeachersModel : StudentsModel;

  Model.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.json({ message: 'Success', role: user.role });
        } else {
          res.json({ message: 'Incorrect password' });
        }
      } else {
        res.json({ message: 'No account found' });
      }
    })
    .catch(err => res.json({ message: 'Server error', error: err }));
});

// Registration route
app.post('/register', (req, res) => {
  const { role } = req.body;
  const Model = role === 'teacher' ? TeachersModel : StudentsModel;

  Model.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.json(err));
});

// Save assignment with PDF upload
app.post('/assignment', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Failed to upload file' });
    }

    const { name, questionTypes, difficulty, questionCount, dueDate, context } = req.body;

    const assignment = {
      name,
      questionTypes,
      difficulty,
      questionCount,
      dueDate,
      context,
      pdfFilePath: req.file ? req.file.path : null // Store the file path if PDF was uploaded
    };

    try {
      // Save assignment to MongoDB
      const savedAssignment = await AssignmentsModel.create(assignment);

      console.log("Assignment saved to MongoDB:", savedAssignment); // For debugging
      res.status(201).json({ message: 'Assignment saved successfully', assignment: savedAssignment });
    } catch (error) {
      console.error("Error saving assignment to MongoDB:", error);
      res.status(500).json({ message: 'Error saving assignment to database', error });
    }
  });
});

// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
