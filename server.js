var http = require("http");
var url = require("url");
var mongoose = require("mongoose");
var qs = require("querystring");

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
    console.log("HTTP Server started");

    if (callback)
        callback();
}

function setupDBConnection(callback) {
    mongoose.connect("mongodb://localhost/sistem");
    var db = mongoose.connection;
    db.on("error", function() {
        throw "Failed to setup DB connection";
    })

    db.on("open", function() {
        console.log("Connected to DB");
        //mongoose.set("debug", true);
        if (callback)
            callback();
    })
}

function start(route, handle, callback) {
    setupDBConnection(function() {
        startHTTPServer(route, handle, callback);
    })
}

exports.start = start;