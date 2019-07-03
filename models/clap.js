let mongoose = require('mongoose');

var ClapSchema = mongoose.Schema({
  organisation: {type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true},
  giver: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true},
  recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true},
  hashtag: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true},
  given: {type: Number, default: 0},
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

// One of the properties chosen here should has index: true
ClapSchema.index({'recipient': 1, 'giver': 1, 'hashtag': 1}, {unique: false});

var LastUpdatedPlugin = require('./plugins/lastUpdated.plugin');
ClapSchema.plugin(LastUpdatedPlugin);

var Clap = mongoose.model('Clap', ClapSchema);

module.exports = Clap;
