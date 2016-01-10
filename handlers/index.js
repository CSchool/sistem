var api = require("../handlerapi");
var contests = require("../database/contests");
var session = require("../session");

function handleIndex(response, request) {
    response.writeHead(200, {
        "Content-type": "text/html"
    });
    api.writeContents(response, function(response, callback) {
        contests.Contest.find({}, function(err, result) {
            session.isAdmin(request, response, function(isAdmin) {
                var formed = "";
                var now = new Date();
                result.forEach(function(contest) {
                    formed += `
                            ${((contest.startTime < now) && (contest.endTime > now))?
                                '<tr class="bold-row">':'<tr>'}
                            <td>${contest.name}</td>
                            <td>${(contest.startTime < now)?
                                ((contest.endTime < now)?"Завершился":"Идёт"):"Не начался"}</td>
                            <td>${contest.startTime.toLocaleString("ru-RU")}</td>
                            <td>${contest.endTime.toLocaleString("ru-RU")}</td>
                            <td>
                                <form action="/contest" method="GET">
                                    <input name="id" type="hidden" value="${contest._id}" />
                                    ${((contest.startTime < now) || isAdmin) ? (session.isAuthorized(request, response)?
                                    `<button name="action" value="participate" type="submit">
                                        Войти
                                    </button>`:"<i>Авторизируйтесь для участия</i>"):
                                    "<i>Турнир не начался</i>"}
                                </form>
                            </td>
                            ${((contest.startTime < now) && (contest.endTime > now))?
                                "</tr>":"</tr>"}
                    `
                })
                response.write(`
                    <h1 class="center">Турниры</h1><br />
                    <table style="margin: 0 auto; min-width: 50%" border="1">
                    <tr>
                        <th>Название</th>
                        <th>Статус</th>
                        <th>Начало</th>
                        <th>Окончание</th>
                        <th>Действия</th>
                    </tr>
                    ${formed}
                    </table>
                `);
                callback();
            })
        })
    }, undefined, request)
}

exports.handlersMap = {
    ["/"] : handleIndex
}