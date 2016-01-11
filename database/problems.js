// Problem MongoDB schema

var mongoose = require("mongoose");

var problemSchema = mongoose.Schema({
    name: String, // Name of problem
    statement: String, // Statement, HTML supported
    timeLimit: Number, // Time limit, in ms
    memoryLimit: Number // Memory limit, in KB
})

var Problem = mongoose.model("Problem", problemSchema);
exports.Problem = Problem;