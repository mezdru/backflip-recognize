var mongoose = require('mongoose');

var organisationSchema = mongoose.Schema({
	name: String,
	tag: { type: String, required: true, index: true, unique: true },
	logo: {
    url: String,
  },
  cover: {
    url: String,
  },
	creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	public: { type: Boolean, default: false },
	premium: { type: Boolean, default: false },
	canInvite: { type: Boolean, default: true },
	google: {
		hd: [String],
	},
	email: {
		domains: [String]
	}
});

var Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;
