var crypto = require("crypto");
var sessions = {};
var Cookies = require("cookies");
var fs = require("fs");
var users = require("./database/users");
var util = require("util");

var syncedUsers = {};

function newSession(username) {
// Start a new session. No password required. Security level is high.
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

function isAdmin(request, response) {
// Is current user an admin?
    var username = getUsername(request, response);
    if (!username) {
        return false;
    }
    return syncedUsers[username].group == 'admin';
}

function isAuthorized(request, response) {
// Simple check, if user logged in
    return getUsername(request, response) !== null;
}

function reloadUsers(callback) {
    util.log("Syncing users to DB");
    users.User.find({}, function(err, result) {
        if (result) {
            for (var i in result) {
                syncedUsers[result[i].username] = {
                    password: result[i].password,
                    group: result[i].group,
                    _id: result[i]._id
                }
            }
            callback();
        }
    })
}

exports.newSession = newSession;
exports.validateSession = validateSession;
exports.logOut = logOut;
exports.getUsername = getUsername;
exports.isAdmin = isAdmin;
exports.isAuthorized = isAuthorized;
exports.reloadUsers = reloadUsers;