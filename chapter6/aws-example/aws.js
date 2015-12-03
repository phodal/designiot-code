var awsIot = require('aws-iot-device-sdk');

var thingShadows = awsIot.thingShadow({
    keyPath: 'certs/fa635d3140-private.pem.key',
    certPath: 'certs/fa635d3140-certificate.pem.crt',
    caPath: 'certs/root-CA.crt',
    clientId: 'phodal',
    region: 'us-west-2'
});

thingShadows.on('connect', function () {
    console.log("Connected...");
    thingShadows.register('phodal');

    // An update right away causes a timeout error, so we wait about 2 seconds
    setTimeout(function () {
        console.log("Updating Led Status...");
        var led = thingShadows.update('phodal', {
            "state": {
                "reported": {
                    "led": false
                }
            }
        });
        console.log("Update:" + led);
    }, 2500);


    // Code below just logs messages for info/debugging
    thingShadows.on('status',
        function (thingName, stat, clientToken, stateObject) {
            console.log('received ' + stat + ' on ' + thingName + ': ' +
                JSON.stringify(stateObject));
        });

    thingShadows.on('update',
        function (thingName, stateObject) {
            console.log('received update ' + ' on ' + thingName + ': ' +
                JSON.stringify(stateObject));
        });

    thingShadows.on('delta',
        function (thingName, stateObject) {
            console.log('received delta ' + ' on ' + thingName + ': ' +
                JSON.stringify(stateObject));
        });

    thingShadows.on('timeout',
        function (thingName, clientToken) {
            console.log('received timeout for ' + clientToken)
        });

    thingShadows
        .on('close', function () {
            console.log('close');
        });
    thingShadows
        .on('reconnect', function () {
            console.log('reconnect');
        });
    thingShadows
        .on('offline', function () {
            console.log('offline');
        });
    thingShadows
        .on('error', function (error) {
            console.log('error', error);
        });

});