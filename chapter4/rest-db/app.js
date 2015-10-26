var express = require('express');
var bodyParser = require('body-parser');
var Database = require('./db');
var db = new Database();

var app = express();
app.use(bodyParser.json());

app.get('/api', function (req, res) {
    var payload = {user: 1};
    db.query(payload, function(results){
        return res.json(results);
    });
});

app.post('/api', function (req, res) {
    var payload = {user: 1};
    var data = {user: 1, led: true};
    if (req.body.led === true) {
        data.led = true;
    }

    db.query(payload, function(results){
        if(results.length>0){
            db.update(data);
            res.send({db: "update"});
        } else {
            db.insert(data);
            res.send({db: "insert"});
        }
    });
});

app.put('/api', function (req, res) {
    var payload = {user: 1};
    var data = {user: 1, led: true};
    if (req.body.led === true) {
        data.led = true;
    }

    db.query(payload, function(results){
        if(results.length>0){
            db.update(data);
            res.send({db: "update"});
        } else {
            db.insert(data);
            res.send({db: "insert"});
        }
    });
});

app.delete('/api', function (req, res) {
    data.method = 'delete';
    data = {};
    res.send(data);
});

app.listen(3000);