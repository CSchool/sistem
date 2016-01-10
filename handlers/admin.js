var api = require("../handlerapi");
var session = require("../session");
var users = require("../database/users");

function handleAdmin(response, request) {
    session.isAdmin(request, response, function(result) {
        if (result) {
            response.writeHead(200, {
                "Content-type": "text/html"
            });

            api.writeContents(response, function(response, callback) {
                users.User.find({}, function(err, result) {
                    var formed = "";
                    result.forEach(function(user) {
                        formed += `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.group}</td>
                            </tr>
                        `
                    })
                    response.write(`
                        <table style="width: 50%; margin: 0 25%" border="1">
                        <tr>
                            <th>Ник</th>
                            <th>Группа</th>
                        </tr>
                        ${formed}
                        </table>
                    `);
                    callback();
                })
            }, undefined, request)
        } else {
            response.writeHead(403, {
                "Content-type": "text/html"
            });

            api.writeContents(response, function(response, callback) {
                response.write('<p><div class="error">У Вас нет доступа к запрашиваемой странице</div></p>');
                callback();
            }, undefined, request)
        }
    })
}

exports.handlersMap = {
    ["/admin"]: handleAdmin
}