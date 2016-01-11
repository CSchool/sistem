// User MongoDB schema

var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    username: String, // Username
    password: String, // Password, currently not hashed
    group: String // Group, curently "admin" or "users"
})

var User = mongoose.model("User", userSchema);
exports.User = User;