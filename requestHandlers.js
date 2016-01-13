var fs = require("fs");
var mime = require("mime");
var util = require("util");

var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory())
            results = results.concat(walk(file))
        else
            results.push(file)
    })
    return results
}

var handlersMap = {};

// Generating handlers for /frontend/public (stuff like css, client js should be available by default)

var publicFiles = walk("frontend/public");
publicFiles.forEach(function(file) {
    var clientPath = file.substr(("frontend/public").length);
    handlersMap[clientPath] = function(response, request) {
        fs.stat(file, function(err, data) {
            if (err)
                throw err;
            var lastModReq = request.headers["if-modified-since"];
            if (lastModReq)
                lastModReq = new Date(lastModReq).getTime();
            if (Math.floor(data.mtime.getTime() / 1000) == 
                Math.floor(lastModReq) / 1000) {
                response.writeHead(304, {
                    "Last-modified": data.mtime.toUTCString()
                });
                response.end();
                return;
            } else {
                response.writeHead(200, {
                    "Content-type": mime.lookup(file),
                    "Last-modified": data.mtime.toUTCString()
                });
                fs.readFile(file, "utf8", function(err, data) {
                    response.end(data);
                })
            }
        })
    }
})


// Loading custom handlers

var handlers = walk("handlers");
handlers.forEach(function(handlerPath) {
    util.log("Loading handler", handlerPath);

    var handler = require("./" + handlerPath);

    for (var path in handler.handlersMap) {
        handlersMap[path] = handler.handlersMap[path];
    }
})

exports.handlersMap = handlersMap;