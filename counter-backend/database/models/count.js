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

const List = mongoose.model("List", CountSchema);

module.exports = List;