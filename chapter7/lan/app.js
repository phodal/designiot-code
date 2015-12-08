var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var Database = require('./db');
var db = new Database();

var mqtt = require('mqtt');
var mqttServer = require('./mqttServer');

var coap = require('coap');
var coapServer = require('./coapServer');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname + '/', 'public')));

app.set('views', path.join(__dirname + '/', 'views'));
app.set('view engine', 'jade');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    'use strict';
    res.render('index', {
        title: 'Home'
    });
});

app.get('/dashboard', function (req, res) {
    'use strict';
    res.render('dashboard', {
        title: 'Dashboard'
    });
});

app.get('/user/:user_id/devices/:device_id/result/:result_id', function (req, res) {
    var payload = {user: parseInt(req.params.user_id), device: parseInt(req.params.device_id)};
    db.findOrder(payload, parseInt(req.params.result_id),  function (results) {
        return res.json(results);
    });
});

app.get('/user/:user_id/devices/:device_id/results', function (req, res) {
    var payload = {user: parseInt(req.params.user_id), device: parseInt(req.params.device_id)};
    db.find(payload, function (results) {
        return res.json(results);
    });
});

app.post('/user/:user_id/devices/:device_id', function (req, res) {
    var data = req.body;
    data.user = parseInt(req.params.user_id);
    data.device = parseInt(req.params.device_id);

    db.insert(data);
    res.send({db: "insert"});
});

app.get('/user/:user_id/devices', function (req, res) {
    var payload = {user: parseInt(req.params.user_id), devices: true };
    db.find(payload, function (results) {
        return res.json(results);
    });
});

app.post('/user/:user_id/devices', function (req, res) {
    var data = req.body;
    data.user = parseInt(req.params.user_id);
    data.devices = true;

    var payload = {user: parseInt(req.params.user_id), devices: true };
    db.find(payload, function (results) {
        if (results.length > 0) {
            db.update(data);
            res.send({db: "update"});
        } else {
            db.insert(data);
            res.send({db: "insert"});
        }
    });
});

app.listen(3000, function () {
    console.log("server run on http://localhost:%d", 3000);
});

mqtt.MqttServer(mqttServer).listen(1883, function () {
    console.log("mqtt server listening on port %d", 1883);
});

coap.createServer(coapServer).listen(5683, function () {
    console.log("coap server listening on port %d", 5683);
});