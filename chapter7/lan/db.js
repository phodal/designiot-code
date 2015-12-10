var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/designiot";

function MongoPersistence() {

}

MongoPersistence.prototype.insert = function (payload) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var insertDocuments = function (db, callback) {
            payload.date = new Date();
            var collection = db.collection("documents");
            collection.insert(payload, function (err, result) {
                callback(result);
            });
        };
        insertDocuments(db, function () {
            db.close();
        });
    });
};

MongoPersistence.prototype.update = function (payload) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var updateDocument = function (db, callback) {
            var collection = db.collection("documents");
            collection.update({user: payload.user}, {$set: payload}, function (err, result) {
                callback();
            });
        };
        updateDocument(db, function () {
            db.close();
        });
    });
};

MongoPersistence.prototype.find = function (queryOptions, queryCB) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var findDocuments = function (db, query, callback) {
            var collection = db.collection("documents");
            collection.find(query).toArray(function (err, docs) {
                callback(docs);
            });
        };

        findDocuments(db, queryOptions, function (result) {
            db.close();
            queryCB(result);
        });
    });
};

MongoPersistence.prototype.findOrder = function (queryOptions, order, queryCB) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var findDocuments = function (db, query, callback) {
            var collection = db.collection("documents");
            collection.find(query).limit(1).skip(order).toArray(function (err, docs) {
                callback(docs);
            });
        };

        findDocuments(db, queryOptions, function (result) {
            db.close();
            queryCB(result);
        });
    });
};

/*
 A MongoDB tailable cursor would work a bit like a queue. It can work with a capped collection so you do not have to explicitly delete items in the collection. It is quite efficient, but keep in mind that MongoDB will lock the whole collection (the database actually) at each write operation, so it limits the scalability. Another scalability limitation is the number of connections. Each client connection will add a connection thread in the mongod servers (or mongos).

 Still you can expect tens of thousands of items per second without major problems, which may be enough for a range of applications.

 On the other hand, Redis can generally handle much more connections simultaneously, because each connection does not create a thread (Redis is a single-theaded event loop). It is also extremely CPU efficient, because it does not queue at all the items. With Redis pub/sub, the items are propagated to the subscribers in the same event loop iteration than the publication. The items are not even stored in memory, Redis does not even have a single index to maintain. They are only retrieved from a socket buffer to be pushed in another socket buffer.

 However, because there is no queuing, delivery of Redis pub/sub messages is not guaranteed at all. If a subscriber is down when a message is published, the message will be lost for this subscriber.

 With Redis, you can expect hundreds of thousands of items per second on a single core, especially if you use pipelining, and multiple publication clients.
 */

MongoPersistence.prototype.subscribe = function (queryOptions, queryCB) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var subDocuments = function (db, query, callback) {
            var collection = db.collection("documents");
            collection.find(query).sort({$natural: 1}).limit(1).toArray(function (err, doc) {
                callback(doc);
            });
        };

        subDocuments(db, queryOptions, function (result) {
            db.close();
            queryCB(result);
        });
    });
};

module.exports = MongoPersistence;