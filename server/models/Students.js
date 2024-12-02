const mongoose = require('mongoose');

const StudentsSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: 'student' } // Add role with a default value of 'student'
});

const StudentsModel = mongoose.model('students', StudentsSchema);
module.exports = StudentsModel;
