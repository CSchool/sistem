// This file handles authorization, registration and logoff of users
// Paths:
//  - /authorize
//  - /regiser
//  - /logoff

var api = require("../handlerapi");
var formidable = require("formidable");
var users = require("../database/users");
var Cookies = require("cookies");
var session = require("../session");

function handleAuthorize(response, request) {
    var cookies = new Cookies(request, response);
    var renderPage = function(errorMsg) {
        response.writeHead(200, {
            "Content-type": "text/html"
        });
        api.writeContents(response, request, function(response, callback) {
            if (errorMsg) {
                response.write('<div class="error center">' + errorMsg + '</div>');
            }
            api.writeFile(response, "frontend/authorize.html", callback);
        })
    }
    if (request.method.toLowerCase() == "post") {
        var form = new formidable.IncomingForm();
        var authFail = function() {
            renderPage("Неверный логин или пароль");
        }
        var authOK = function(username) {
            cookies.set("SSID", session.newSession(username));
            cookies.set("username", username);
            response.writeHead(302, {
                "Location": "/"
            });
            response.end();
        }
        form.parse(request, function(err, fields, files) {
            if (!(fields.username && fields.password)) {
                authFail();
                return;
            }

            users.User.find({
                username: fields.username,
                password: fields.password
            }, function(err, result) {
                if (result.length > 0)
                    authOK(fields.username);
                else
                    authFail();
            })
        })
    } else {
        renderPage();
    }
}

function handleRegister(response, request) {
    var cookies = new Cookies(request, response);
    var renderPage = function(errorMsg) {
        response.writeHead(200, {
            "Content-type": "text/html"
        });
        api.writeContents(response, request, function(response, callback) {
            if (errorMsg) {
                response.write('<div class="error center">' + errorMsg + '</div>');
            }
            api.writeFile(response, "frontend/register.html", callback);
        })
    }
    if (request.method.toLowerCase() == "post") {
        var form = new formidable.IncomingForm();
        var authFail = function(err) {
            renderPage(err);
        }
        var authOK = function(username, password) {
            var user = new users.User({username: username, password: password, group: "users"});
            user.save(function(err, user) {
                if (err) {
                    console.error(err);
                }
                else {
                    cookies.set("SSID", session.newSession(username));
                    cookies.set("username", username);
                    response.writeHead(302, {
                        "Location": "/"
                    });
                    response.end();
                }
            })
        }
        form.parse(request, function(err, fields, files) {
            if (!(fields.username && fields.password && fields.passwordConfirm)) {
                authFail("Не заполнено обязательное поле");
                return;
            }

            if (fields.password !== fields.passwordConfirm) {
                authFail("Пароли не совпадают");
                return;
            }

            if ((fields.username.length < 3) || (fields.username.length > 15)) {
                authFail("Логин должен содержать от 3 до 15 символов")
                return;
            }

            if (!fields.username.match(/^[a-zA-Z0-9\-_]+$/)) {
                authFail("Логин должен состоять только из латинских букв, " + 
                        "цифр, знаков минус и нижнего подчёркивания");
                return;
            }

            users.User.find({username: fields.username}, function(err, result) {
                if (result.length == 0)
                    authOK(fields.username, fields.password);
                else
                    authFail("Такой пользователь уже существует");
            })
        })
    } else {
        renderPage();
    }
}

function handleLogOut(response, request) {
    var cookies = new Cookies(request, response);
    session.logOut(cookies.get("SSID"));
    cookies.set("SSID");
    cookies.set("username");
    response.writeHead(302, {
        "Location": "/"
    });
    response.end();
}


exports.handlersMap = {
    ["/authorize"]: handleAuthorize,
    ["/logout"]: handleLogOut,
    ["/register"]: handleRegister
}