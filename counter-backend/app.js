const express = require('express');
const app = express();

const mongoose = require('./database/mongoose');
const Count = require('./database/models/count');
const Locations = require('./database/models/location');
const MotionTick = require('./database/models/motionTick');

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

// This is the high-level overview Set that must be kept synchronized at all times!
const observedLocations = new Set();
var observedFixtures = [];

smartdirector.apiReq('192.168.5.1', 'admin:FiatLux007', 'subscribe', {}, 443)
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
        //General idea: Check if any new motionData is reported in clusterData. If yes, check if that motionData is within our observedFixtures. If yes, add motion to /motions
        if (!clusterData.hasOwnProperty('fixture') || !clusterData.fixture.some(oneFixture => oneFixture.sensorStats.hasOwnProperty('motion'))) { return; }
        // Check if motionData is within observedFixtures
        if (!clusterData.fixture.some(oneFixture => observedFixtures.some(oFixtures => `/fixture/${oneFixture.serialNum}` === oFixtures))) { return; }
        clusterData.fixture.forEach(oneFixture => {
            if (!oneFixture.sensorStats.hasOwnProperty('motion')) { return; }
            if (!observedFixtures.some(oFixtures => `/fixture/${oneFixture.serialNum}` === oFixtures)) { return; }
            console.log("OneFixture is" + oneFixture.serialNum)
            Locations.findOne({ childFixture: `/fixture/${oneFixture.serialNum}` })
                .then((location) => {
                    console.log(location.location);
                    console.log(oneFixture.serialNum);
                    console.log(oneFixture.sensorStats.motion.instant);
                    (new MotionTick({'location': location.location, 'serialNum': oneFixture.serialNum, 'time':oneFixture.sensorStats.motion.instant}))
                        .save()
                        .then()
                        .catch(e => console.error(e));
                })
        })
    })
    .on('error', (e => console.error(e)))
    .on('end', (end => {
        console.log(end);
        // TODO Restart node app.js
    }));



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

//Searching for all motionTick data in the database
app.get("/motionTicks", (req, res) => {
    MotionTick.find({})
        .then(locations => res.send(locations))
        .catch((error) => console.log(error))
});

//Handling new count data.
app.post('/counts', (req, res) => {
    (Locations.findOne({ 'location': req.body.location }))
        .then(location => {
            if (!location) { console.error("Count tried for location " + req.body.location + " which doesn't exist in the db"); return }
            if (req.body.get) {
                (Count.find({ location: req.body.location }).sort({ _id: -1 }).limit(1))
                    .then((count) => {
                        // Sending count of location and adding location to observable list.
                        res.send(count);
                        // Check if size of Set increases and if yes call update observedFixtures subroutine
                        const tempSize = observedLocations.size;
                        observedLocations.add(req.body.location);
                        if (tempSize === observedLocations.size) { return }
                        console.log("Added location " + req.body.location + " to observed locations");
                        //Add location childFixtures to observedFixtures, if childFixtures exist
                        if (!location.childFixture.length) { return; }
                        observedFixtures = observedFixtures.concat(location.childFixture);
                        console.log("Added childFixtures to observedFixtures " + observedFixtures);
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