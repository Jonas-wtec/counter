const mongoose = require('mongoose');

const CountSchema = new mongoose.Schema({
    time: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
    },
    location: {
        type: String
    }
});

const Count = mongoose.model("Count", CountSchema);

module.exports = Count;