const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  college: { type: String, required: true },
});

const dataVisualization = new mongoose.Schema({
  title: { type: String, default: true },
  description: { type: String },
  price: { type: String, default: true },
  totalSlots: { type: Number, default: 60 },
  availableSlots: { type: Number, default: true },
  participants: [participantSchema],
});

const DataVisualization = mongoose.model('DataVisualization', dataVisualization);

module.exports = DataVisualization;