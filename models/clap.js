let mongoose = require('mongoose');

var ClapSchema = mongoose.Schema({
  organisation: {type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true},
  giver: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true},
  receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true},
  hashtag: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true},
  given: {type: Number, default: 0},
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

// @todo This doesn't work
ClapSchema.index(
  {'giver': 1, 'receiver': 1, 'hashtag': 1}, 
  {unique: true, partialFilterExpression: { deleted: false }}
);

var LastUpdatedPlugin = require('./plugins/lastUpdated.plugin');
ClapSchema.plugin(LastUpdatedPlugin);

var Clap = mongoose.model('Clap', ClapSchema);

module.exports = Clap;
