// This file handles individual contest page
// Paths:
//  - /contest

var api = require("../handlerapi");
var url = require("url");
var contests = require("../database/contests");
var problems = require("../database/problems");
var session = require("../session");
var _ = require("lodash");

function handleContest(response, request) {
    var isAuthorized = session.isAuthorized(request, response);
    response.writeHead(200, {
        "Content-type": "text/html"
    });
    api.writeContents(response, request, function(response, callback) {
        var isAdmin = session.isAdmin(request, response);
        var now = new Date();
        var query = url.parse(request.url, true).query;
        var id = null;
        if (query.id)
            id = query.id;
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
                response.write('<h1 class="center">' + result[0].name + '</h1>');
                var problems = result[0].problems;
                problems.sort(function(a, b) {
                    return (a.name - b.name) ;
                })

                var tmpl = _.template(`
                    <table style="margin: 0 auto; min-width: 50%" border="1">
                        <tr>
                            <th>Задача</th>
                            <th>Действия</th>
                        </tr>
                        <% if (isAdmin) { %>
                        <tr>
                            <td><b>Новая задача</b></td>
                            <td>
                                <form action="/problem">
                                    <input name="contestId" type="hidden" value="<%=contestId%>" />
                                    <input name="problemId" type="hidden" value="-1" />
                                    <button name="action" value="manage" type="submit">
                                        Создать
                                    </button>
                                </form>
                            </td>
                        </tr>
                        <% }; %>
                        <% problems.forEach(function(problem) { %>
                        <tr>
                            <td><%=problem.name%></td>
                            <td>
                                <form action="/problem" method="GET">
                                    <input name="problemId" type="hidden" value="<%=problem.id%>" />
                                    <button name="action" value="participate" type="submit">
                                        Решать
                                    </button>
                                    <% if (isAdmin) { %>
                                    <button name="action" value="manage" type="submit">
                                        Настроить
                                    </button>
                                    <button name="action" value="remove" type="submit">
                                        Удалить из турнира
                                    </button>
                                    <% }; %>
                                </form>
                            </td>
                        </tr>
                        <% }); %>
                    </table>
                `)

                response.write(tmpl({
                    problems: problems,
                    isAdmin: isAdmin,
                    contestId: id
                }));
            } else {
                response.write('<p><div class="error">Неверный ID турнира</div></p>');
            }
            callback();
        })
    });
}

exports.handlersMap = {
    ["/contest"]: handleContest
}