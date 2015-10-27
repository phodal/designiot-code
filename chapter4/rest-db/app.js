var express = require('express');
var bodyParser = require('body-parser');
var Database = require('./db');
var db = new Database();

var app = express();
app.use(bodyParser.json());

app.get('/api/', function (req, res) {
    var payload = {};
    db.find(payload, function(results){
        return res.json(results);
    });
});

app.get('/api/:user_id', function (req, res) {
    var payload = {user: req.params.user_id};
    db.find(payload, function(results){
        return res.json(results);
    });
});

function updateData(req, res) {
    var payload = {user: req.params.user_id};
    var data = {user: req.params.user_id, led: true};
    if (req.body.led === true) {
        data.led = true;
    }

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

app.listen(3000);