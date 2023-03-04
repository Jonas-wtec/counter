var EventEmitter = require('events').EventEmitter;


let https;
try {
    https = require('node:https');
} catch (err) {
    console.log('https support is disabled!');
}

const apiReq = (ip, auth, reqType, reqData, port) => {

    var emitter = new EventEmitter();
    console.log("New empty storage created!")
    var storage = [];

    const postData = JSON.stringify({
        "protocolVersion": "1",
        "schemaVersion": "1.3.0",
        "requestType": reqType.toString(),
        "requestData": reqData
    });

    const options = {
        hostname: ip.toString(),
        port: port,
        path: '/uApi',
        method: 'POST',
        rejectUnauthorized: false,
        auth: auth.toString(),
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        //if status !200 => reject Promise. DO WE NEED TO STOP THE REQUEST AFTERWARDS???
        console.log(`STATUS: ${res.statusCode}`);
        if (res.statusCode != 200) { emitter.emit('error', res.statusCode) }
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            evaluateChunk(chunk, emitter, storage);
        });
        res.on('end', () => {
            emitter.emit('end', "End of data stream");
        });
    });


    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        emitter.emit('error', e);
    });

    // Write data to request body
    req.write(postData);
    req.end();
    return emitter;

}

const evaluateChunk = (chunk, emitter, storage) => {
    if (!chunk) { console.log("Chunk is empty... skipping"); return }
    try {
        JSON.parse(chunk);
        emitter.emit('data', chunk);
    } catch {
        recursiveEval(chunk, emitter, storage);
    }
}

const recursiveEval = (substring, emitter, storage) => {
    if (/\r\n\r?\n?\r?\n?/g.test(substring)) {
        const match = /\r\n\r?\n?\r?\n?/g.exec(substring);
        const substring1 = substring.substring(0, match.index);
        const substring2 = substring.substring(match.index).replace(/\r\n\r?\n?\r?\n?/, '');
        storage.push(substring1);
        try {
            JSON.parse(storage.join(''))
            emitter.emit('data', storage.join(''));
        } catch {
            if (/\r\n\r\n/g.test(substring) || /\r\n/g.test(substring)) { console.log("GOTCHA BITCH") }
            console.log("Coundn't parse storage in recursive eval... skipping")
        }
        storage.length = 0;
        if (substring2.length) { recursiveEval(substring2, emitter, storage) }
    } else {
        storage.push(substring);
    }
}




module.exports = { apiReq };