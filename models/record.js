var mongoose = require('mongoose');

var recordSchema = mongoose.Schema({});

var Record = mongoose.model('Record', recordSchema);

module.exports = Record;