var crypto = require("crypto");
var sessions = {};
var Cookies = require("cookies");
var fs = require("fs");
var users = require("./database/users");

function newSession(username) {
    var len = 16;
    var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ_-";
    var ssid = "";
    do
    {
        for (var i = 0; i < len; ++i) {
            ssid += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    } while (sessions[ssid]);

    console.log("New Session: username=" + username + "; SSID=" + ssid);

    sessions[ssid] = username;
    console.log(sessions);
    return ssid;
}

function validateSession(ssid, username) {
    if (!(ssid && username))
        return false;
    return (sessions[ssid] == username);
}

function logOut(ssid) {
    delete sessions[ssid];
}

function getUsername(request, response) {
    var cookies = new Cookies(request, response);
    var ssid = cookies.get("SSID");
    var username = cookies.get("username");
    if (validateSession(ssid, username))
        return username;
    else
        return null;
}

function isAdmin(request, response, callback) {
    var username = getUsername(request, response);
    if (!username) {
        callback(false);
        return;
    }
    users.User.find({username: username, group: "admin"}, function(err, result) {
        if (result.length > 0)
            callback(true);
        else
            callback(false);
    })
}

function isAuthorized(request, response) {
    return getUsername(request, response) !== null;
}

exports.newSession = newSession;
exports.validateSession = validateSession;
exports.logOut = logOut;
exports.getUsername = getUsername;
exports.isAdmin = isAdmin;
exports.isAuthorized = isAuthorized;