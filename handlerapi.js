var fs = require("fs");
var session = require("./session");
var Cookies = require("cookies");
var url = require("url");

function writeFile(response, filename, callback, contentMap, request) {
    fs.readFile(filename, "utf8", function(err, data) {
        if (err)
            throw err;
        if (contentMap) {
            contentMap(request, response, function(cMap) {
                for (var el in cMap) {
                    data = data.split("$__" + el + "__$").join(cMap[el]);
                }
                response.write(data);
                if (callback)
                    callback();
            });
        } else {
            response.write(data);
            if (callback)
                callback();
        }
    })
}

function pageContentMap(request, response, callback) {
    var username = session.getUsername(request, response);
    var rightControls = '<a href="/authorize">Войти</a> | <a href="/register">Зарегистрироваться</a>';
    var cb = function() {
        callback({
            "RIGHT_CONTROLS": rightControls
        });
    }
    if (username) {
        rightControls = 'Здравствуйте, <b>' + username +'</b>! ' +
                        '<a href="/logout">Выйти</a>';
        session.isAdmin(request, response, function(result) {
            if (result)
                rightControls = 'Здравствуйте, <b>' + username +'</b>! ' +
                                '<a href="/admin">Админка</a> ' +
                                '<a href="/logout">Выйти</a>';
            cb();
        })
    } else {
        cb();
    }
}

function writeContents(response, content, callback, request) {
    var cb = function() {
        response.end();
        if (callback)
            callback();
    };
    var pathname = url.parse(request.url).pathname;
    if (pathname.substr(0, 4) == "/raw") {
        if (typeof content === "function") {
            content(response, function() {
               cb();
            });
        }
        else if (typeof content === "string") {
            response.write(content);
            cb();
        }
    }
    else {
        writeFile(response, "frontend/page_top.html", function() {
            if (typeof content === "function") {
                content(response, function() {
                    writeFile(response, "frontend/page_bottom.html", cb, pageContentMap, request);
                });
            }
            else if (typeof content === "string") {
                response.write(content); 
                writeFile(response, "frontend/page_bottom.html", cb, pageContentMap, request);
            }
        }, pageContentMap, request);
    }
}

exports.writeFile = writeFile;
exports.writeContents = writeContents;