var mongoose = require("mongoose");

var contestSchema = mongoose.Schema({
    name: String,
    problems: Array,
    startTime: Date,
    endTime: Date
})

var Contest = mongoose.model("Contest", contestSchema);
exports.Contest = Contest;