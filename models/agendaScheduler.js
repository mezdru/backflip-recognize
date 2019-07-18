var AgendaPack = require('agenda');
var User = require('./user');
var MailjetHelper = require('../helpers/mailjet.helper');
var UrlHelper = require('../helpers/url.helper');
var Clap = require('./clap');

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

      let initialClap = await  Clap.findOne({_id: job.attrs.data._id})
                        .populate('recipient', '_id tag name')
                        .populate('giver', '_id tag name')
                        .populate('organisation', '_id tag name cover logo')
                        .populate('hashtag', '_id tag name name_translated');

      let recipientUser = await User.findOne({'orgsAndRecords.record': job.attrs.data.recipient});
      let locale = recipientUser ? (recipientUser.locale || 'en') : 'en';
      let iHashtagName = initialClap.hashtag.getTranslatedName(locale);
      let clapSet = new Set([iHashtagName]);
      let hashtagsString = iHashtagName;

      let newClaps = await Clap.find({recipient: job.attrs.data.recipient, created: {$gt: initialClap.created}})
                      .populate('hashtag', '_id tag name name_translated');

      newClaps.forEach(newClap => {
        let hashtagName = newClap.hashtag.getTranslatedName(locale);
        if(!clapSet.has(hashtagName)) {
          hashtagsString += ", " + hashtagName;
          clapSet.add(hashtagName);
        }
      });

      console.log('AGENDA: CLAP: Notify ' + recipientUser.loginEmail);

      MailjetHelper.sendRecognizeEmail(
        recipientUser.loginEmail,
        hashtagsString,
        initialClap.organisation,
        (new UrlHelper(initialClap.organisation.tag, 'profile/' + initialClap.recipient.tag, null, locale)).getUrl(),
        locale
      ).then().catch(e => console.log(e));

      this.removeJob(job).then(()=> done());

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