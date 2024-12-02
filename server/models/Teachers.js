const mongoose = require('mongoose');

const TeachersSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: 'teacher' } // Add role with a default value of 'teacher'
});

const TeachersModel = mongoose.model('teachers', TeachersSchema);
module.exports = TeachersModel;
