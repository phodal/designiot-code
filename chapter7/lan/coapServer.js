module.exports = function (req, res) {
    var handlerGet = function () {
        res.code = '2.05';
        res.end(JSON.stringify({method: 'get'}));
    };

    var handPut = function () {
        res.code = '2.05';
        res.end(JSON.stringify({method: 'put'}));
    };

    var handPost = function () {
        res.code = '2.05';
        res.end(JSON.stringify({method: 'post'}));
    };

    var other = function () {
        res.code = '4.00';
        res.end(JSON.stringify({method: 'not support'}));
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
            return other();
    }
};
