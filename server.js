var http = require("http");
var url = require("url");
var mongoose = require("mongoose");
var qs = require("querystring");
var async = require("async");
var session = require("./session");
var util = require("util");

function startHTTPServer(route, handle, callback) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        if (pathname.substr(0, 4) == "/raw")
            pathname = pathname.substr(4);
        if (pathname == "")
            pathname = "/";
        route(handle, pathname, response, request);
    }

    http.createServer(onRequest).listen(8888);
    util.log("HTTP Server started");

    if (callback)
        callback();
}

function setupDBConnection(callback) {
    mongoose.connect("mongodb://localhost/sistem");
    var db = mongoose.connection;
    db.on("error", function() {
        callback("Failed to setup DB connection");
    })

    db.on("open", function() {
        util.log("Connected to DB");
        mongoose.set("debug", true);
        callback(null);
    })
}

function start(route, handle) {
    setupDBConnection(function(err) {
        if (err)
            throw err;
        else
            session.reloadUsers(function() {
                startHTTPServer(route, handle)
            })
    })
}

exports.start = start;