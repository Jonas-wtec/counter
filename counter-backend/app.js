const express = require('express');
const app = express();

const mongoose = require('./database/mongoose');
const Count = require('./database/models/count');
const Locations = require('./database/models/location');

const smartdirector = require('./webService/smartdirector');

//mongoose.connection.dropDatabase();
app.use(express.json());

//Set CORS Headers for communication on the same serve
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// This is the high-level overview List that must be kept synchronized at all times!
const observedLocations = []


smartdirector.apiReq('192.168.5.1', 'admin:FiatLux007', 'subscribe', { }, 443)
    .once('data', (rawClusterData => {

        const clusterData = JSON.parse(rawClusterData);

        // Synchronize data between smartdirector/app.js/db
        clusterData.responseData.location.forEach(location => {
            Locations.find({})
                .then(dbLocations => {
                    if (dbLocations.some(dbLocationObject => dbLocationObject.location === location.name)) {
                        console.log("Location " + location.name + " already exists in db! Skipping...")
                        return;
                    }
                    (new Locations({ 'location': location.name }))
                        .save()
                        .then(() => console.log("Save location " + location.name + " in db"))
                        .catch((error) => console.log(error))
                })
                .catch(e => console.log(e))
        });

    }))
    .on('data', data => {
        const t = data;
        // Generel idea: 
    })
    .on('error', (e => console.log(e)))
    .on('end', (end => console.log(end)));



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
            .then((count) => {
                console.log("In Here")
                res.send(count);
            })
            .catch((error) => console.log(error));
        return
    }
    (Locations.find({ 'location': req.body.location }))
        .then(location => {
            if (!location.length) { console.error("Count tried for location " + req.body.location + "which doesn't exist in the db"); return }
            (new Count({ 'count': req.body.count, 'location': req.body.location }))
                .save()
                .then((count) => res.send(count))
                .catch((error) => console.log(error))
        })
        .catch(error => console.log(error));

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