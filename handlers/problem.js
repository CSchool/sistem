// This file handles individual problem page
// Paths:
//  - /problem

var api = require("../handlerapi");
var session = require("../session");
var url = require("url");
var contests = require("../database/contests");
var problems = require("../database/problems");
var formidable = require("formidable");
var mongoose = require("mongoose");

function handleProblem(response, request) {
    var isAuthorized = session.isAuthorized(request, response);
    var isAdmin = session.isAdmin(request, response); 

    var query = url.parse(request.url, true).query;
    var id = null;
    if (query.problemId)
        id = query.problemId;
    var contestId = null;
    if (query.contestId)
        contestId = query.contestId;
    var action = "participate";
    if (query.action === "manage")
        action = "manage";
    if (query.action === "delete")
        action = "delete";

    if (isAdmin && (action === "delete")) {
        problems.Problem.remove({_id: id}, function(err) {
            if (err) {
                throw err;
            }
            response.writeHead(302, {
                "Content-type": "text/html",
                "Location": (contestId) ? ("/contest?id=" + contestId) : ("/")
            });
            response.end();
        })
    } else {
        var renderPage = function() {
            response.writeHead(200, {
                "Content-type": "text/html"
            })
            api.writeContents(response, request, function(response, callback) {
                var now = new Date();
                    contestId = query.contestId;
                if ((!isAuthorized) || (!isAdmin && (action !== "participate"))) {
                    response.write('<p><div class="error">У Вас нет доступа к запрашиваемой странице</div></p>');
                    callback();
                    return;
                }
                problems.Problem.find({_id: id}, function(err, result) {
                    if ((result) || ((id === "-1") && (action === "manage"))) {
                        var problem;
                        if (result) {
                            problem = result[0]
                        } else {
                            problem = {
                                name: "",
                                timeLimit: 2000,
                                memoryLimit: 65000,
                                statement: ""
                            }
                        }

                        if (action == "participate") {
                            response.write(`
                                <h1 class="center">${problem.name}</h1>
                                <p>
                                    Лимит времени: <i>${problem.timeLimit}мс</i><br />
                                    Лимит памяти: <i>${problem.memoryLimit}КБ</i><br />
                                </p>
                                <p>
                                    ${problem.statement}
                                </p>
                            `);
                        } else {
                            response.write(`
                                <p>
                                <form method="POST">
                                    <input type="hidden" name="problemId" value="${id}" />
                                    <input type="hidden" name="contestId" value="${contestId}">
                                    <b>Название задачи:</b>
                                    <br />
                                    <input type="text" name="problemName" value="${problem.name}" />
                                    <br /><br />
                                    <b>Лимит времени(мс):</b>
                                    <br />
                                    <input type="number" name="problemTime" value="${problem.timeLimit}" />
                                    <br /><br />
                                    <b>Лимит памяти(КБ):</b>
                                    <br />
                                    <input type="number" name="problemMemory" value="${problem.memoryLimit}" />
                                    <br /><br />
                                    <b>Условие (поддерживается HTML синтаксис):</b>
                                    <br />
                                    <textarea name="problemStatement">${problem.statement}</textarea>
                                    <br /><br />
                                    <button type="submit" name="action" value="save">Сохранить</button>
                                </p>
                                </form>
                            `)
                        }
                    } else {
                        response.write('<p><div class="error">Неверный ID задачи</div></p>');
                    }
                    callback();
                })
            })
        };

        if (request.method.toLowerCase() === "post") {
            if (isAdmin) {
                var form = new formidable.IncomingForm();
                form.parse(request, function(err, fields, files) {
                    if (!fields.problemId) {
                        response.writeHead(302, {
                            "Content-type": "text/html",
                            "Location": "/"
                        })
                        response.end();
                        return;
                    }
                    var name = fields.problemName || "null";
                    var time = fields.problemTime || 2000;
                    var memory = fields.problemMemory || 2000;
                    var statement = fields.problemStatement || "No statement";

                    var id = fields.problemId;
                    if (id == "-1")
                        id = undefined

                    var contestId = fields.contestId;

                    problems.Problem.findOneAndUpdate({
                            "_id": mongoose.Types.ObjectId(id)
                        }, {
                            "name": name,
                            "timeLimit": time,
                            "memoryLimit": memory,
                            "statement": statement
                        }, {
                            "upsert": true,
                            "new": true
                        }, function(err, problem) {
                            if (err)
                                throw err;
                            if (!id) {
                                id = problem._id;
                                contests.Contest.findOneAndUpdate({
                                    "_id": mongoose.Types.ObjectId(contestId)
                                }, {
                                    $push: {
                                        "problems": mongoose.Types.ObjectId(id)
                                    }
                                }, {
                                    new: true
                                }, function() {
                                    if (err)
                                        throw err;
                                    response.writeHead(302, {
                                        "Content-type": "text/html",
                                        "Location": (contestId) ? ("/contest?id=" + contestId) : ("/")
                                        })
                                    response.end();
                                })
                            } else {
                                response.writeHead(302, {
                                    "Content-type": "text/html",
                                    "Location": (contestId) ? ("/contest?id=" + contestId) :
                                    ("/problem?problemId=" + id + "&action=manage")
                                })
                                response.end();
                            }
                    })
                }) 
            } else {
                response.writeHead(302, {
                    "Content-type": "text/html",
                    "Location" : "/"
                })
                response.end();
            }
        } else {
            renderPage();
        }
    }
}

exports.handlersMap = {
    ["/problem"]: handleProblem
}