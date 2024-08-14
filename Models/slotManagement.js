const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    totalSlots: { type: Number, required: true },
    availableSlots: { type: Number, required: true }
});

module.exports = mongoose.model('Slot', slotSchema);