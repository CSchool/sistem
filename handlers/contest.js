// This file handles individual contest page
// Paths:
//  - /contest

var api = require("../handlerapi");
var url = require("url");
var fs = require("fs");
var contests = require("../database/contests");
var problems = require("../database/problems");
var session = require("../session");
var formidable = require("formidable");
var _ = require("lodash");

function handleContest(response, request) {
    var isAuthorized = session.isAuthorized(request, response);
    var isAdmin = session.isAdmin(request, response);
    response.writeHead(200, {
        "Content-type": "text/html"
    });
    var query = url.parse(request.url, true).query;
    var id = null;
    if (query.id)
        id = query.id;

    var action = "participate";
    if (query.action === "manage")
        action = "manage";
    if (query.action === "delete")
        action = "delete";

    var renderPage = function() {
        api.writeContents(response, request, function(response, callback) {
            var now = new Date();
            if (!isAuthorized) {
                response.write('<p><div class="error">У Вас нет доступа к запрашиваемой странице</div></p>');
                callback();
                return;
            }
            contests.Contest.find({_id: id})
            .populate('problems')
            .exec(function(err, result) {
                if (result) {
                    if ((result[0].startTime > now) && !isAdmin) {
                        response.write('<p><div class="error">У Вас нет доступа к запрашиваемой странице</div></p>');
                        callback();
                        return;
                    }
                    var problems = result[0].problems;
                    problems.sort(function(a, b) {
                        return (a.name - b.name) ;
                    })
                    fs.readFile("frontend/templates/contest.html", "utf8", function(err, data) {
                        if (err)
                            throw err;
                        response.write(_.template(data)({
                            problems: problems,
                            isAdmin: isAdmin,
                            contestId: id,
                            contest: result[0]
                        }));
                        callback();
                    });
                } else {
                    response.write('<p><div class="error">Неверный ID турнира</div></p>');
                    callback();
                }
            })
        });
    };

    if (isAdmin && (action === "delete")) {
        contests.Contest.remove({_id: id}, function(err) {
            if (err)
                throw err;
            response.writeHead(302, {
                "Content-type": "text/html",
                "Location": "/"
            })
        })
    } else {
        if (request.method.toLowerCase() === "post") {
            if (isAdmin) {
                var form = formidable.IncomingForm();
            }
        }
    }
}

exports.handlersMap = {
    ["/contest"]: handleContest
}