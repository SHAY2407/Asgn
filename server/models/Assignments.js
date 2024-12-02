const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  questionTypes: { type: [String], required: true },
  difficulty: { type: Number, required: true },
  questionCount: { type: Number, required: true },
  dueDate: { type: Date },
  context: { type: String },
  pdfFilePath: { type: String }, // Store the file path of the uploaded PDF
  createdAt: { type: Date, default: Date.now } // Automatically store the creation time
});

// Create the Assignment model from the schema
const AssignmentsModel = mongoose.model('Assignment', AssignmentSchema);

module.exports = AssignmentsModel;
