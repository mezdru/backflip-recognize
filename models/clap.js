let mongoose = require('mongoose');
var algolia = require('algoliasearch')(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_WRITE_KEY);
var index = algolia.initIndex('world');

var ClapSchema = mongoose.Schema({
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
  giver: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
  hashtag: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
  given: { type: Number, default: 0 },
  message: { type: String },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// One of the properties chosen here should has index: true
ClapSchema.index({ 'recipient': 1, 'giver': 1, 'hashtag': 1 }, { unique: false });
ClapSchema.index({ 'recipient': 1, 'organisation': 1, 'hashtag': 1 }, { unique: false });

ClapSchema.methods.algoliaSync = function() {
  Clap.aggregate(
    [
      {
        $match: {
          hashtag: this.hashtag,
          recipient: this.recipient,
          organisation: this.organisation
        }
      },
      {
        $group: {
          _id: "$hashtag",
          claps: { $sum: "$given" }
        }
      }
    ]).then(claps => {
      try {
        var currentClap = claps.find(clap => clap._id.equals(this.hashtag));
        // pull algolia object
        index.getObject(this.recipient, ['hashtags'], (err, algoliaObject) => {
          if (err) throw err;
          var indexOfWing = algoliaObject.hashtags.findIndex(hashtag => JSON.stringify(hashtag._id) === JSON.stringify(this.hashtag));
          algoliaObject.hashtags[indexOfWing].claps = currentClap.claps;

          // push update
          index.partialUpdateObject(algoliaObject, (err, algoliaObjectUpdated) => {
            if (err) throw err;
            console.log(`Sync ${algoliaObjectUpdated.objectID} (Clap) with Algolia`);
          });

        });
      } catch (err) {
        console.log(err);
      }
    }).catch(e => console.log(e));
}


ClapSchema.post('save', (doc) => {
  doc.algoliaSync();
})

var LastUpdatedPlugin = require('./plugins/lastUpdated.plugin');
ClapSchema.plugin(LastUpdatedPlugin);

var Clap = mongoose.model('Clap', ClapSchema);

module.exports = Clap;
