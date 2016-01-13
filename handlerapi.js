// This file provides common API for handlers

var fs = require("fs");
var session = require("./session");
var Cookies = require("cookies");
var url = require("url");

function writeFile(response, filename, callback, contentMap, request) { 
// Writes a file from location to response
    fs.readFile(filename, "utf8", function(err, data) {
        if (err)
            throw err;
        if (contentMap) {
            var cMap = contentMap(request, response);
            for (var el in cMap) {
                data = data.split("$__" + el + "__$").join(cMap[el]);
            }
            response.write(data);
            if (callback)
                callback();
        } else {
            response.write(data);
            if (callback)
                callback();
        }
    })
}

function pageContentMap(request, response) {
// Weird function, used to replace $__SOMETHING__$ in static pages with text, that can differ
// in different situations
    var username = session.getUsername(request, response);
    var rightControls = `
        <form style="margin-right: 16px; display: inline" method="POST" action="/authorize">
            <input type="hidden" name="redirect" value="${request.url.replace(/\"/, "\\\"")}" />
            <span style="margin-right: 8px">
                Логин: <input style="width: 75px" type="text" name="username" />
            </span>
            <span style="margin-right: 8px">
                Пароль: <input style="width: 75px" type="password" name="password" />
            </span>
            <input type="submit" value="Войти" name="authorize" />
        </form>
        <a href="/register">Зарегистрироваться</a>
    `;
    if (username) {
        rightControls = 'Здравствуйте, <b>' + username +'</b>! ' +
            '<a href="/logout">Выйти</a>';
        if (session.isAdmin(request, response))
            rightControls = 'Здравствуйте, <b>' + username +'</b>! ' +
                '<a href="/admin">Админка</a> ' +
                '<a href="/logout">Выйти</a>';  
    }
    return {
        "RIGHT_CONTROLS": rightControls
    }
}

function writeContents(response, request, content, callback) {
// Used to print page content with header and footer
// Call like this: 
// writeContents(response, request, function(response, end) {
//    <YOUR PAGE CODE HERE>
//    end();
//})
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