var Database = require('./db');
var db = new Database();

module.exports = function (req, res) {
    var errorHandle = function () {
        res.code = '4.00';
        res.end(JSON.stringify({method: 'not support'}));
    };

    // 1. URI Query
    var uriQuery = {};
    var existBlock = false;
    for (var i = 0; i < req.options.length; i++) {
        if (req.options[i].name === 'Uri-Query') {
            var query = req.options[i].value.toString().split('=');
            uriQuery[query[0]] = parseInt(query[1]);
            existBlock = true;
        }
    }
    if (!existBlock) {
        return errorHandle();
    }
    // 2. RESTful API方法
    //var urlArray = req.url.split("/");
    //for (var i = 1; i < urlArray.length; i = i + 2) {
    //    uriQuery[urlArray[i]] = parseInt(urlArray[i + 1]);
    //}
    var handlerGet = function () {
        var payload = {user: uriQuery.user, device: uriQuery.device};
        db.find(payload, function (dbResult) {
            res.code = '2.05';
            res.end(JSON.stringify({result: dbResult}));
        });
    };

    var handlePut = function () {
        var userId = parseInt(uriQuery.user);
        var deviceId = parseInt(uriQuery.device);
        var payload = {user: userId, device: deviceId};

        if (isNaN(userId) || isNaN(deviceId)) {
            res.code = '4.01';
            return res.end(JSON.stringify({"error": "username or device undefined"}));
        }

        var data;
        try {
            data = JSON.parse(req.payload.toString());
        } catch (err) {
            res.code = '4.04';
            res.end(err);
        }
        data.user = userId;
        data.device = deviceId;

        db.find(payload, function (results) {
            if (results.length > 0) {
                db.update(data);
                res.code = '2.01';
                res.end(JSON.stringify({method: 'update'}));
            } else {
                db.insert(data);
                res.code = '2.01';
                res.end(JSON.stringify({method: 'insert'}));
            }
        });
    };

    var handlePost = function () {
        var userId = parseInt(uriQuery.user);
        var deviceId = parseInt(uriQuery.device);
        var payload = {user: userId, device: deviceId};

        if (isNaN(userId) || isNaN(deviceId)) {
            res.code = '4.04';
            return res.end(JSON.stringify({"error": "username or device undefined"}));
        }
        var data;
        try {
            data = JSON.parse(req.payload.toString());
        } catch (err) {
            res.code = '4.04';
            return res.end(err);
        }
        data.user = userId;
        data.device = deviceId;

        db.find(payload, function (results) {
            if (results.length > 0) {
                db.update(data);
                res.code = '2.01';
                res.end(JSON.stringify({method: 'update'}));
            } else {
                db.insert(data);
                res.code = '2.01';
                res.end(JSON.stringify({method: 'insert'}));
            }
        });
    };

    switch (req.method) {
        case 'GET':
            handlerGet();
            break;
        case 'PUT':
            handlePut();
            break;
        case 'POST':
            handlePost();
            break;
        default:
            return errorHandle();
    }
};
