let mongoose = require('mongoose');

// Client
var UserSessionSchema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  accessToken: {type: mongoose.Schema.Types.ObjectId, ref: 'AccessToken'},
  refreshToken: {type: mongoose.Schema.Types.ObjectId, ref: 'RefreshToken', required: true},
  clientId: {type: String, required: true},
  userAgent: {type: String},
  userIP: {type: String},
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

UserSessionSchema.statics.findByAccessToken = function(aTokenId) {
  return this.findOne({accessToken: mongoose.Types.ObjectId(aTokenId)}).exec();
};

var LastUpdatedPlugin = require('./plugins/lastUpdated.plugin');
UserSessionSchema.plugin(LastUpdatedPlugin);

var UserSession = mongoose.model('UserSession', UserSessionSchema);

module.exports = UserSession;
