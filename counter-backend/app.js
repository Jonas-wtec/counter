const express = require('express');
const app = express();

const mongoose = require('./database/mongoose');
const Count = require('./database/models/count');
const Locations = require('./database/models/location');

const smartdirector = require('./webService/smartdirector');

mongoose.connection.dropDatabase();
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


smartdirector.apiReq('192.168.5.1', 'admin:FiatLux007', 'subscribe', {}, 443)
    .once('data', (rawClusterData => {

        const clusterData = JSON.parse(rawClusterData);

        // Synchronize data between smartdirector/app.js/db
        clusterData.responseData.location.forEach(location => {
            console.log(location.name + " and " + location?.childFixture);
            Locations.find({})
                .then(dbLocations => {
                    if (dbLocations.some(dbLocationObject => dbLocationObject.location === location.name)) {
                        console.log("Location " + location.name + " already exists in db! Skipping...")
                        return;
                    }
                    (new Locations({ 'location': location.name, 'childFixture': location?.childFixture }))
                        .save()
                        .then(() => console.log("Saved location and respective fixtures" + location.name + " in db"))
                        .catch((error) => console.log(error))
                })
                .catch(e => console.log(e))
        });

    }))
    .on('data', rawClusterData => {
        const clusterData = JSON.parse(rawClusterData).responseData;
        //console.log(clusterData);
        // Generel idea: go through list observedLocations and look up respective fixtures in db -> save any matches under /smartdirector
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

//Handling new count data.
app.post('/counts', (req, res) => {
    (Locations.find({ 'location': req.body.location }))
        .then(location => {
            if (!location.length) { console.error("Count tried for location " + req.body.location + " which doesn't exist in the db"); return }
            if (req.body.get) {
                console.log("Trying to get count of location");
                (Count.find({ location: req.body.location }).sort({ _id: -1 }).limit(1))
                    .then((count) => {
                        // Sending count of location and adding location to observable list.
                        res.send(count);
                    })
                    .catch((error) => console.log(error));
                return
            }
            (new Count({ 'count': req.body.count, 'location': req.body.location }))
                .save()
                .then((count) => res.send(count))
                .catch((error) => console.log(error))
        })
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