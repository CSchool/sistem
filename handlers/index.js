// This file handles main page. Currently only list of contests is displayed
// Paths:
//  - /

var api = require("../handlerapi");
var contests = require("../database/contests");
var session = require("../session");
var fs = require("fs");
var _ = require("lodash");

function handleIndex(response, request) {
    var isAuthorized = session.isAuthorized(request, response);
    response.writeHead(200, {
        "Content-type": "text/html"
    });
    api.writeContents(response, request, function(response, callback) {
        contests.Contest.find({}, function(err, result) {
            var isAdmin = session.isAdmin(request, response)
            var formed = "";
            var now = new Date();
            fs.readFile("frontend/templates/index.html", "utf8", function(err, data) {
                if (err)
                    throw err;
                response.write(_.template(data)({
                    contests: result,
                    isAuthorized: isAuthorized,
                    isAdmin: isAdmin,
                    now: now,
                }));
                callback();
            });
        })
    })
}

exports.handlersMap = {
    ["/"] : handleIndex
}