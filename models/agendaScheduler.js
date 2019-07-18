var AgendaPack = require('agenda');
var User = require('./user');
var Record = require('./record');
var MailjetHelper = require('../helpers/mailjet.helper');
var UrlHelper = require('../helpers/url.helper');
var Organisation = require('./organisation');
var Clap = require('./clap');

let asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

var Agenda = (function () {
  this.agenda = new AgendaPack({ db: { address: process.env.MONGODB_URI, collection: 'jobs' } });
  this.i18n;

  this.agenda.on('ready', function () {
    console.log('AGENDA: Ready');
    this.agenda.start();

    /**
     * @description Send email : notify user after claps received
     */
    this.agenda.define('sendRecognizeEmail', async (job, done) => {
      let data = job.attrs.data;

      let initialClap = await  Clap.findOne({_id: data._id})
                        .populate('recipient', '_id tag name')
                        .populate('giver', '_id tag name')
                        .populate('organisation', '_id tag name cover logo')
                        .populate('hashtag', '_id tag name name_translated');

      let recipientUser = await User.findOne({'orgsAndRecords.record': data.recipient});
      let locale = recipientUser ? (recipientUser.locale || 'en') : 'en';
      let iHashtag = initialClap.hashtag;
      let iHashtagName = (iHashtag ? ((iHashtag.name_translated ? (iHashtag.name_translated[locale] || iHashtag.name_translated['en']) || iHashtag.name || iHashtag.tag : iHashtag.name || iHashtag.tag)) : "")
      let clapSet = new Set();
      let hashtagsString = iHashtagName;

      clapSet.add(iHashtagName);

      let newClaps = await Clap.find({recipient: data.recipient, created: {$gt: initialClap.created}})
                          .populate('hashtag', '_id tag name name_translated');

      console.log('new claps: ', newClaps.length);

      await asyncForEach(newClaps, async (newClap) => {
        let hashtag = newClap.hashtag;
        let hashtagName = (hashtag ? ((hashtag.name_translated ? (hashtag.name_translated[locale] || hashtag.name_translated['en']) || hashtag.name || hashtag.tag : hashtag.name || hashtag.tag)) : "");
        if(!clapSet.has(hashtagName)) {
          hashtagsString += ", " + hashtagName;
          clapSet.add(hashtagName);
        }
      });

      MailjetHelper.sendRecognizeEmail(
        recipientUser.loginEmail,
        hashtagsString,
        initialClap.organisation,
        (new UrlHelper(initialClap.organisation.tag, 'profile/' + initialClap.giver.tag, null, locale)).getUrl(),
        locale
      ).then().catch(e => console.log(e));

      this.removeJob(job).then(()=> {
        return done();
      });

    });

    /**
     * @description Schedule Notify User by Email after claps received
     */
    this.scheduleNotifyUserRecognized = async function(clap) {
      if (process.env.NODE_ENV === 'production' || true) {
        await agenda.jobs({name: 'sendRecognizeEmail', 'data.recipient': clap.recipient, nextRunAt: {$gte: (new Date())}})
        .then(async concurrentJobs => {
          console.log(concurrentJobs.length)
          if( !concurrentJobs || concurrentJobs.length === 0) {
            let job = this.agenda.create('sendRecognizeEmail', clap);
            job.schedule('in 15 seconds');
            await job.save();
          }
        });
      }

    }

    /**
     * @description Remove job from database
     */
    this.removeJob = async function (job) {
      return await job.remove(err => {
        if (!err) {
          console.log('Successfully removed job from collection');
          return;
        } else {
          console.log('error', err);
        }
      });
    };

  }.bind(this));
  return this;
})();

module.exports = Agenda;