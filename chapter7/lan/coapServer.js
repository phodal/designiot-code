var Database = require('./db');
var db = new Database();

module.exports = function (req, res) {
    var errorHandle = function () {
        res.code = '4.00';
        res.end(JSON.stringify({method: 'not support'}));
    };

    var uriQuery = {};
    var existBlock = false;
    for (var i = 0; i < req.options.length; i++) {
        if (req.options[i].name === 'Uri-Query') {
            var query = req.options[i].value.toString().split(':');
            uriQuery[query[0]] = parseInt(query[1]);
            existBlock = true;
        }
    }
    if (!existBlock) {
        return errorHandle();
    }

    var handlerGet = function () {
        var payload = {user: uriQuery.user, device: uriQuery.device};
        db.find(payload, function (dbResult) {
            res.code = '2.05';
            res.end(JSON.stringify({result: dbResult}));
        });
    };

    var handPut = function () {
        res.code = '2.05';
        res.end(JSON.stringify({method: 'put'}));
    };

    var handPost = function () {
        res.code = '2.05';
        res.end(JSON.stringify({method: 'post'}));
    };

    switch (req.method) {
        case 'GET':
            handlerGet();
            break;
        case 'PUT':
            handPut();
            break;
        case 'POST':
            handPost();
            break;
        default:
            return errorHandle();
    }
};
