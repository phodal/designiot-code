var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var Database = require('./db');
var db = new Database();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname + '/', 'public')));

app.set('views', path.join(__dirname + '/', 'views'));
app.set('view engine', 'jade');

app.use(function(req, res, next) {
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

app.post('/', function (req, res) {
    var userID = req.body.user;

    var payload = { user: userID};
    var led = req.body.led === "on";

    var data = { user: userID, led: led};
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

app.get('/api/', function (req, res) {
    var payload = {};
    db.find(payload, function (results) {
        return res.json(results);
    });
});

app.get('/api/:user_id', function (req, res) {
    var payload = {user: req.params.user_id};
    db.find(payload, function (results) {
        return res.json(results);
    });
});

function updateData(req, res) {
    var userId = req.params.user_id;
    var payload = {user: userId};

    var data = req.body;
    data.user = userId;

    db.find(payload, function (results) {
        if (results.length > 0) {
            db.update(data);
            res.send({db: "update"});
        } else {
            db.insert(data);
            res.send({db: "insert"});
        }
    });
}

app.post('/api/:user_id', function (req, res) {
    updateData(req, res);
});

app.put('/api/:user_id', function (req, res) {
    updateData(req, res);
});

app.delete('/api/:user_id', function (req, res) {
    res.send({});
});

app.listen(3000, function () {
    console.log("server run on http://localhost:%d", 3000);
});