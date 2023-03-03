const express = require('express');
const app = express();
const mongoose = require('./database/mongoose');

const Count = require('./database/models/count');
const Locations = require('./database/models/location');

//mongoose.connection.dropDatabase();
app.use(express.json());

//Set CORS Headers for communication on the same serve
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Searching for all count data in the database
app.get("/counts", (req, res) => {
    Count.find({})
        .then(counts => res.send(counts))
        .catch((error) => console.log(error))
});

//Searching for all location data in the database
app.get("/locations", (req, res) => {
    Locations.find({})
        .then(locations => res.send(locations))
        .catch((error) => console.log(error))
});

//Handling new count data. If the location of the count is new a new location will be created as well
app.post('/counts', (req, res) => {
    if (req.body.get) {
        (Count.find({ location: req.body.location }).sort({ _id: -1 }).limit(1))
            .then((count) => res.send(count))
            .catch((error) => console.log(error));
        return
    }
    (Locations.find({ 'location': req.body.location }))
        .then(location => {
            if (location.length) { return }
            (new Locations({ 'location': req.body.location }))
                .save()
                .catch((error) => console.log(error))
        })
        .catch(error => console.log(error));
    (new Count({ 'count': req.body.count, 'location': req.body.location }))
        .save()
        .then((count) => res.send(count))
        .catch((error) => console.log(error))
});

//Deleting specific counts
app.delete('/counts/:countId', (req, res) => {
    const deleteTasks = (count) => {
        Count.deleteMany({ _countId: count._id })
            .then(() => count)
            .catch((e) => console.log(e))
    };
    Count.findByIdAndDelete(req.params.countId)
        .then((list) => res.send(deleteTasks(list)))
        .catch((error) => console.log(error))
});

//Configure app to listen on port 3000
app.listen(3000, () => console.log("Server Connected on port 3000"));