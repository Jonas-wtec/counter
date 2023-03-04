const mongoose = require('mongoose');

const motionTickSchema = new mongoose.Schema({
    location: {
        type: String
    },
    serialNum: {
        type: String
    },
    time: {
        type: Date,
        set: d => new Date(d * 1000)
    }
});

const motionTick = mongoose.model("motionTick", motionTickSchema);

module.exports = motionTick;