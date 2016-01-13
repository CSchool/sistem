// This file handles main page. Currently only list of contests is displayed
// Paths:
//  - /

var api = require("../handlerapi");
var contests = require("../database/contests");
var session = require("../session");
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
            response.write(_.template(`
                <h1 class="center">Турниры</h1><br />
                <table style="margin: 0 auto; min-width: 50%" border="1">
                <tr>
                    <th>Название</th>
                    <th>Статус</th>
                    <th>Начало</th>
                    <th>Окончание</th>
                    <th>Действия</th>
                </tr>
                <% result.forEach(function(contest) { %>
                <%=((contest.startTime < now) && (contest.endTime > now))?
                    '<tr class="bold-row">':'<tr>' %>
                <td><%=contest.name %></td>
                <td><%=(contest.startTime < now)?
                    ((contest.endTime < now)?"Завершился":"Идёт"):"Не начался" %></td>
                <td><%=contest.startTime.toLocaleString("ru-RU") %></td>
                <td><%=contest.endTime.toLocaleString("ru-RU") %></td>
                <td>
                    <form action="/contest" method="GET">
                        <input name="id" type="hidden" value="<%=contest._id %>" />
                        <%=((contest.startTime < now) || isAdmin) ? (isAuthorized?
                        '<button type="submit">Войти</button>':'<i>Авторизируйтесь для участия</i>'):
                        '<i>Турнир не начался</i>' %>
                    </form>
                </td>
                <%=((contest.startTime < now) && (contest.endTime > now))?
                    "</tr>":"</tr>" %>
                <% }); %>
                </table>
            `)({
                result: result,
                isAuthorized: isAuthorized,
                isAdmin: isAdmin,
                now: now,
            }));
            callback();
        })
    })
}

exports.handlersMap = {
    ["/"] : handleIndex
}