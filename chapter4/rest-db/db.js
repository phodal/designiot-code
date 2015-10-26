var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/designiot";

function MongoPersistence() {

}

MongoPersistence.prototype.insert = function (payload) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var insertDocuments = function (db, callback) {
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
            var topic = {user: payload.user};
            collection.update(topic, {$set: {led: payload.led}}, function (err, result) {
                callback(result);
            });
        };
        updateDocument(db, function () {
            db.close();
        });
    });
};

MongoPersistence.prototype.query = function (queryOptions, queryCB) {
    'use strict';
    MongoClient.connect(url, function (err, db) {
        var findDocuments = function (db, query, callback) {
            var collection = db.collection("documents");
            collection.find(query, {_id: false}).toArray(function (err, docs) {
                callback(docs);
            });
        };

        findDocuments(db, queryOptions, function (result) {
            db.close();
            queryCB(result);
        });
    });
};


module.exports = MongoPersistence;