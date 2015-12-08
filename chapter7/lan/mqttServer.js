var Database = require('./db');
var db = new Database();

module.exports = function (client) {
    var self = this;

    if (!self.clients) self.clients = {};

    client.on('connect', function (packet) {
        self.clients[packet.clientId] = client;
        client.id = packet.clientId;
        console.log("CONNECT: client id: " + client.id);
        client.subscriptions = [];
        client.connack({returnCode: 0});
    });

    client.on('subscribe', function (packet) {
        var granted = [];

        console.log("SUBSCRIBE(%s): %j", client.id, packet);

        for (var i = 0; i < packet.subscriptions.length; i++) {
            var qos = packet.subscriptions[i].qos
                , topic = packet.subscriptions[i].topic
                , reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

            var myJson = topic.split('/');
            if (myJson[0] && myJson[1] && myJson[0] === 'device') {
                var deviceId = parseInt(myJson[1]);
                if (deviceId > 0) {
                    var payload = {user: 1, device: deviceId};
                    db.findOrder(payload, parseInt(deviceId), function (results) {
                        granted.push(results);
                        client.subscriptions.push(results)
                    });
                }
            }
            granted.push(qos);
            client.subscriptions.push(reg);
        }

        client.suback({messageId: packet.messageId, granted: granted});
    });

    client.on('publish', function (packet) {
        console.log("PUBLISH(%s): %j", packet.clientId, packet);
        for (var k in self.clients) {
            var client = self.clients[k];

            for (var i = 0; i < client.subscriptions.length; i++) {
                var subscription = client.subscriptions[i];

                if (subscription.test(packet.topic)) {
                    client.publish({topic: packet.topic, payload: packet.payload});
                    break;
                }
            }
        }
    });

    client.on('pingreq', function (packet) {
        console.log('PINGREQ(%s)', client.id);
        client.pingresp();
    });

    client.on('disconnect', function (packet) {
        client.stream.end();
    });

    client.on('close', function (packet) {
        delete self.clients[client.id];
    });

    client.on('error', function (e) {
        client.stream.end();
        console.log(e);
    });
};