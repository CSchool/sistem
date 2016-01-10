var api = require("../handlerapi");
var url = require("url");
var contests = require("../database/contests");
var session = require("../session");

function handleContest(response, request) {
    var isAuthorized = session.isAuthorized(request, response);
    response.writeHead(200, {
        "Content-type": "text/html"
    });
    api.writeContents(response, function(response, callback) {
        session.isAdmin(request, response, function(isAdmin) {
            var now = new Date();
            var query = url.parse(request.url, true).query;
            var id = null;
            if (query.id)
                id = query.id;
            var action = "participate";
            if (query.action == "manage")
                action = "manage";
            if ((!isAuthorized) || (!isAdmin && (action == "manage"))) {
                response.write('<p><div class="error">У Вас нет доступа к запрашиваемой странице</div></p>');
                callback();
                return;
            }
            contests.Contest.find({_id: id}, function(err, result) {
                if (result) {
                    if ((result[0].startTime > now) && !isAdmin) {
                        response.write('<p><div class="error">У Вас нет доступа к запрашиваемой странице</div></p>');
                        callback();
                        return;
                    }
                    response.write('<h1 class="center">' + result[0].name + '</h1>');
                    if (action == "manage")
                        response.write('<h3 class="center">Управление</h3>');
                    var problems = result[0].problems;
                    problems.sort(function(a, b) {
                        return (a.name - b.name) ;
                    })

                    var formed = "";
                    if (isAdmin)
                        formed = `
                            <tr>
                                <td><b>Новая задача</b></td>
                                <td>
                                    <form action="/problem">
                                        <input name="contest_id" type="hidden" value="${id}" />
                                        <input name="id" type="hidden" value="-1" />
                                        <button name="action" value="manage" type="submit">
                                            Создать
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        `
                    problems.forEach(function(problem) {
                        formed += `
                            <tr>
                                <td>${problem.name}</td>
                                <td>
                                    <form action="/problem" method="GET">
                                        <input name="contest_id" type="hidden" value="${id}" />
                                        <input name="id" type="hidden" value="${problem.id}" />
                                        <button name="action" value="participate" type="submit">
                                            Решать
                                        </button>
                                        ${isAdmin?
                                        `<button name="action" value="manage" type="submit">
                                            Управлять
                                        </button>`:""}
                                    </form>
                                </td>
                            </tr>
                        `
                    })
                    response.write(`
                        <table style="margin: 0 auto; min-width: 50%" border="1">
                        <tr>
                            <th>Задача</th>
                            <th>Действия</th>
                        </tr>
                        ${formed}
                        </table>
                    `);
                } else {
                    response.write('<p><div class="error">Неверный ID турнира</div></p>');
                }
                callback();
            })
        })
    }, undefined, request);
}

exports.handlersMap = {
    ["/contest"]: handleContest
}