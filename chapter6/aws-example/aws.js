var awsIot = require('aws-iot-device-sdk');

var device = awsIot.device({
   keyPath: 'awsCerts/private.pem.key',
  certPath: 'awsCerts/certificate.pem.crt',
    caPath: 'awsCerts/root-CA.crt',
  clientId: 'Led',
    region: 'us-west-2'
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('topic_1');
    device.publish('topic_2', JSON.stringify({ test_data: 1}));
    });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });