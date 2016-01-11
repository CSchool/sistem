var crypto = require("crypto");
var sessions = {};
var Cookies = require("cookies");
var fs = require("fs");
var users = require("./database/users");

function newSession(username) {
// Start a new session. No password required. Security level is high.
// TODO: load user collection on server start, dynamically update it, get rid of silly callbacks in isAdmin
    var len = 16;
    var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ_-";
    var ssid = "";
    do
    {
        for (var i = 0; i < len; ++i) {
            ssid += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    } while (sessions[ssid]);

    sessions[ssid] = username;
    return ssid;
}

function validateSession(ssid, username) {
// Check if session valid
    if (!(ssid && username))
        return false;
    return (sessions[ssid] == username);
}

function logOut(ssid) {
// Delete session. Note, it DOES NOT remove cookies, it just makes them worthless.
    delete sessions[ssid];
}

function getUsername(request, response) {
// Get current user's username
    var cookies = new Cookies(request, response);
    var ssid = cookies.get("SSID");
    var username = cookies.get("username");
    if (validateSession(ssid, username))
        return username;
    else
        return null;
}

function isAdmin(request, response, callback) {
// Is current user an admin? Find out in callback(answer) {}
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
// Simple check, if user logged in
    return getUsername(request, response) !== null;
}

exports.newSession = newSession;
exports.validateSession = validateSession;
exports.logOut = logOut;
exports.getUsername = getUsername;
exports.isAdmin = isAdmin;
exports.isAuthorized = isAuthorized;