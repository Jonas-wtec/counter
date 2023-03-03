const mongoose = require('mongoose');

const CountSchema = new mongoose.Schema({
    location: {
        type: String
    }
});

const Location = mongoose.model("Location", CountSchema);

module.exports = Location;