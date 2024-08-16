const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  eventTitle: { type: String, required: true }, 
  paymentStatus: { type: String, default: "pending" }, 
  paymentAmount: { type: Number, required: true }
});

const ideaExplorer = new mongoose.Schema({
  title: { type: String, default: "Idea Explorer" },
  description: { type: String },
  price: { type: Number, default: 100 },
  totalSlots: { type: Number, default: 100 },
  availableSlots: { type: Number, default: 100 },
  participant:[participantSchema]
});

const IdeaExplorer = mongoose.model('IdeaExplorer', ideaExplorer);

module.exports = IdeaExplorer;