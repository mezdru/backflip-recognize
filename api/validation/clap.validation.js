var express = require('express');
var router = express.Router();
var Record = require('../../models/record');

router.use(async (req, res, next) => {
  if(req.user.superadmin) return next();

  var giver = await Record.findOne({_id: req.body.clap.giver, organisation: req.organisation._id}).lean();
  var recipient = await Record.findOne({_id: req.body.clap.recipient, organisation: req.organisation._id}).lean();

  if(giver && recipient && giver._id.equals(recipient._id)) return res.status(422).json({message: "You can't clap yourself!"});

  if( giver && 
      recipient && 
      recipient.hashtags.find(hashtag => hashtag.equals(req.body.clap.hashtag) && 
      req.body.clap.given >= 0) &&
      req.user.orgsAndRecords.find(oar => oar.record.equals(giver._id)))
    return next();

  return res.status(422).json({message: 'The clap object is not valid.'});
});

module.exports = router;