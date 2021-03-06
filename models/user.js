let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
  orgsAndRecords: [
    {
      _id: false,
      // Can be populated or not, use getId to get Id.
      organisation: {type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', default: null},
      // Can be populated or not, use getId to get Id.
      record: {type: mongoose.Schema.Types.ObjectId, ref: 'Record', default: null},
      admin: Boolean,
      monthly: { type: Boolean, default: true },
      welcomed: { type: Boolean, default: false }
    }
  ],
  google: { // Google subdocument will be deprecated. We are now using GoogleUser object.
    id: {type: String, index: true, unique: true, sparse: true},
    //@todo rename to primaryEmail
    email: {type: String, index: true, unique: true, sparse: true},
    normalized: {type: String, index: true, unique: true, sparse: true},
    hd: String,
    tokens: {
      id_token: String,
      refresh_token: String,
      access_token: String
    },
  },
  email: {
    value: {type: String, index: true, unique: true, sparse: true},
    normalized: {type: String, index: true, unique: true, sparse: true},
    hash: {type: String, index: true, unique: true, sparse: true},
    token: String,
    generated: Date,
    validated: {type: Boolean, default: false}
  },
  last_login: { type: Date },
  last_action: {type: Date},
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  superadmin: Boolean,
  hashedPassword: {type: String, select: false},
  locale: {type: String},
  salt: {type: String, select: false},
});

userSchema.virtual('loginEmail').get(function() {
  return this.google.email || this.email.value;
});

userSchema.methods.belongsToOrganisation = function(organisationId) {
  return this.orgsAndRecords.some(orgAndRecord => organisationId.equals(getId(orgAndRecord.organisation)));
};

userSchema.methods.getOrgAndRecord = function(organisationId) {
  return this.orgsAndRecords.find(orgAndRecord => organisationId.equals(getId(orgAndRecord.organisation)));
};

/*
* We have submodels within User (oransiation, record...)
* Sometime these are populated (fetched by mongoose), sometime not.
* We want to retrieve the ObjectId no matter.
* @todo move this somewhere tidy like /helpers
*/
function getId(subObject) {
  return subObject._id || subObject;
}

var LastUpdatedPlugin = require('./plugins/lastUpdated.plugin');
userSchema.plugin(LastUpdatedPlugin);

var User = mongoose.model('User', userSchema);

module.exports = User;
