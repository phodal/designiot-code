module.exports = function (client) {
    client.on('connect', function (packet) {
        console.log(packet);
        client.connack({returnCode: 0});
    });

    client.on('subscribe', function (packet) {
        console.log(packet);
        client.suback('subscribe');
    });

    client.on('message', function (topic, message) {
        console.log(message.toString());
    });

    client.on('publish', function (packet) {
        console.log(packet);
    });
    client.on('pingreq', function (packet) {
        return client.pingresp();
    });
    client.on('disconnect', function () {
        return client.stream.end();
    });
    client.on('error', function (error) {
        return client.stream.end();
    });
    client.on('close', function (err) {
        return "";
    });
    return client.on('unsubscribe', function (packet) {
        return client.unsuback({
            messageId: packet.messageId
        });
    });
};
