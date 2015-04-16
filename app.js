/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
"use strict";
var express = require("express"),
    path = require("path"),
    MongoClient = require("mongodb").MongoClient,
    bodyParser = require("body-parser"),
    shortid = require("shortid"),
    app, port = 3000;
var app = express();
var dbURL = "mongodb://localhost:27017/test";

app.use(express.static(path.join(__dirname, "client")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
console.log(MongoClient.db);
app.post("/", function(req, res) {
    var url = req.body.ogurl;
    var index = url.indexOf("localhost:3000");
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            res.status(404).send("Error");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            if (index > -1 && index < 9) {//url shortening
                collection.find({
                    shorturl: url
                }).toArray(function(err, items) {
                    res.json({
                        "url": items[0].longurl
                    });
                });
            } else {
                collection.find({
                    longurl: url
                }).toArray(function(err, items) {
                    if (items.length <= 0) {
                        var shorturl = shortid.generate().toString(36);
                        shorturl = "localhost:3000/" + shorturl;
                        var urlDB = {
                            shorturl: shorturl,
                            longurl: url,
                            views: 1
                        };
                        collection.insert(urlDB, function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.json({
                                    "url": shorturl
                                });
                            }
                        });

                    } else {
                        res.json({
                            "url": items[0].shorturl
                        });
                    }
                });
            }
        }

    });
});


app.get("/top", function(req, res) {

    var url = req.params.url;
    url = "localhost:3000/" + url;
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            res.status(404).send("Error");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            collection.find().sort().limit(10).toArray(function(err, items) {
                res.json(items);

            });
        }
    });

});
app.route("/:url").all(function(req, res) {
    var url = req.params.url;
    url = "localhost:3000/" + url;
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            res.status(404).send("Error");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            collection.find({
                shorturl: url
            }).toArray(function(err, items) {
                if (items.length <= 0) {
                    res.status(404).send("Error");
                } else {
                    collection.update({
                        shorturl: url
                    }, {
                        $inc: {
                            views: 1
                        }
                    });
                    res.redirect(items[0].longurl);
                }
            });

        }
    });
});
app.listen(port);
console.log("Listening on port " + port);