const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  manager:     { type: String },
  location:    { type: String },
  headcount:   { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
