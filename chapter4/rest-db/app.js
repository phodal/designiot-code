var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var data = {led: false};

app.get('/api', function (req, res) {
    data.method = 'get';
    res.send(data);
});

app.post('/api', function (req, res) {
    data.method = 'post';
    if (req.body.led === true) {
        data.led = true;
    } else if (req.body.led === false) {
        data.led = false;
    }
    res.send(data);
});

app.put('/api', function (req, res) {
    data.method = 'put';
    if (req.body.led === true) {
        data.led = true;
    } else if (req.body.led === false) {
        data.led = false;
    }
    res.send(data);
});

app.delete('/api', function (req, res) {
    data.method = 'delete';
    data = {};
    res.send(data);
});

app.listen(3000);