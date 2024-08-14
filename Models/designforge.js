const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  college: { type: String, required: true },
});

const designForge = new mongoose.Schema({
  title: { type: String, default: true },
  description: { type: String },
  price: { type: String, default: true },
  totalSlots: { type: Number, default: 70 },
  availableSlots: { type: Number, default: 70 },
  participants: [participantSchema],
});

const DesignForge = mongoose.model('DesignForge', designForge);

module.exports = DesignForge;
