var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    group: String
})

var User = mongoose.model("User", userSchema);
exports.User = User;