const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  college: { type: String, required: true },
});

const datascienceQuiz = new mongoose.Schema({
  title: { type: String, default: 'Data Science Quiz' },
  description: { type: String },
  price: { type: String, default: 'Free' },
  totalSlots: { type: Number, default: 60 },
  availableSlots: { type: Number, default: 60 },
  participants: [participantSchema],
});

const DataScienceQuiz = mongoose.model('DataScienceQuiz', datascienceQuiz);

module.exports = DataScienceQuiz;