// Contest MongoDB schema

var mongoose = require("mongoose");
var problems = require("./problems");

var contestSchema = mongoose.Schema({
    name: String, // Name of contest
    startTime: Date, // DateTime of start
    endTime: Date, // DateTime of end
    problems: [{type: mongoose.Schema.Types.ObjectId, ref: 'Problem'}] // Problems in contest
})

var Contest = mongoose.model("Contest", contestSchema);
exports.Contest = Contest;