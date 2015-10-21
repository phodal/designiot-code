var express = require('express');
var app = express();

app.get('/api', function(req, res){
    res.send({led: false});
});

app.post('/api', function (req, res) {
    res.send({led: false})
});

app.put('/api', function (req, res) {
    res.send({led: false})
});

app.delete('/api', function (req, res) {
    res.send({led: false})
});

app.listen(3000);