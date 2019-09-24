var mongoose = require('mongoose');

var recordSchema = mongoose.Schema({
  organisation: {type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', default: null, index: true, required: true},
  tag: {type: String, required: true},
  type: {type: String, enum: ['person', 'team', 'hashtag']},
  name: String,
  name_translated: {
    en: String,
    fr: String,
    'en-UK': String
  },
  intro: {type: String},
  description: {type: String},
  picture: {
    url: String,
    path: String,
    emoji: String,
    type: {type: String},
    uuid: String
  },
  cover: {
    url: String,
    path: String,
    type: {type: String},
    uuid: String
  },
  hashtags: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Record'}
  ],
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  // Hidden is used to control the algolia sync, hidden should be passed to false when user onboard
  hidden: {type: Boolean, default: false}
});

recordSchema.methods.getTranslatedName = function(locale) {
  return (this ? (this.name_translated ? (this.name_translated[locale] || this.name_translated['en']) || this.name || this.tag : this.name || this.tag) : "");
}

var Record = mongoose.model('Record', recordSchema);

module.exports = Record;