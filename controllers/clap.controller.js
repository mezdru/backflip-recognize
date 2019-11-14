var Clap = require('../models/clap');
var Record = require('../models/record');
var Organisation = require('../models/organisation');

exports.getClaps = async (req, res, next) => {
  Clap.find({ ...req.query })
    .then(claps => {
      if (claps.length === 0) {
        req.backflipRecognize = { message: 'Claps not found', status: 404 };
      } else {
        req.backflipRecognize = { message: 'Claps found', status: 200, data: claps };
      }
      return next();
    }).catch(err => { return next(err) });
}

exports.getSingleClap = async (req, res, next) => {
  Clap.findOne({ _id: req.params.id })
    .then(clap => {
      if (!clap) {
        req.backflipRecognize = { message: 'Clap not found', status: 404 };
      } else {
        req.backflipRecognize = {
          message: 'Clap found',
          status: 200,
          data: clap,
          organisation: clap.organisation
        };
      }
      return next();
    }).catch(err => {
      if (err.name === 'CastError') {
        req.backflipRecognize = { message: 'Clap id is not valid.', status: 422 };
        return next();
      }
      return next(err);
    });
}

exports.createSingleClap = async (req, res, next) => {
  if (!req.body.clap) {
    req.backflipRecognize = { message: 'Missing body parameter: clap', status: 422 };
    return next();
  }

  let clap = new Clap(req.body.clap);
  clap.owner = req.user._id;
  let dateA = new Date();

  clap.save()
    .then(clapSaved => {
      let dateB = new Date();
      console.log('[CLAP WRITE] - time : ' + (dateB.getTime() - dateA.getTime()) + ' ms');
      req.backflipRecognize = { message: 'Clap saved with success', status: 200, data: clapSaved };
      return next();
    }).catch(err => {
      if (err.name === 'ValidationError') {
        req.backflipRecognize = { message: err.message, status: 422 };
        return next();
      }
      return next(err);
    });
}

exports.getRecordHashtagsClapsSum = async (req, res, next) => {
  let record = await Record.findOne({ _id: req.params.id }).lean();

  if (!record) {
    req.backflipRecognize = { status: 404, message: 'Record not found.' };
    return next();
  }
  let dateA = new Date();

  Clap.aggregate(
    [
      {
        $match: {
          hashtag: { $in: record.hashtags },
          recipient: record._id,
          organisation: record.organisation
        }
      },
      {
        $group: {
          _id: "$hashtag",
          claps: { $sum: "$given" },
          clapObjectCount: { $sum: 1 }
        }
      }
    ]
  ).then(clapsCount => {
    let dateB = new Date();
    console.log('[CLAP AGGREGATION] - time : ' + (dateB.getTime() - dateA.getTime()) + ' ms');
    req.backflipRecognize = { status: 200, message: 'Claps count fetch with success.', data: clapsCount, organisation: record.organisation };
    return next();
  }).catch(err => { return next(err) });
}

exports.getOrganisationsClapsSum = async (req, res, next) => {
  Clap.aggregate(
    [
      {
        $group: {
          _id: "$organisation",
          claps: { $sum: "$given" },
          clapObjectCount: { $sum: 1 }
        }
      },
      {
        $sort: { "claps": -1 }
      }
    ]
  ).then(async clapsCount => {
    var clapsCountPopulated = await Organisation.populate(clapsCount, {path: "_id", select: "_id tag name"});

    req.backflipRecognize = { status: 200, message: 'Claps count by organisation fetch with success.', data: clapsCountPopulated };
    return next();
  }).catch(err => { return next(err) });
}

exports.scheduleRecognizeEmail = async (req, res, next) => {
  if(req.backflipRecognize.status === 200) {
    var Agenda = require('../models/agendaScheduler');
    Agenda.scheduleNotifyUserRecognized(req.backflipRecognize.data);
  }
  return next();
}

exports.getClapHistory2 = async (req, res, next) => {
  var recipient = await Record.findOne({_id: req.params.id, organisation: req.organisation._id});
  if(!recipient) {
    req.backflipRecognize = {status: 404, message: 'The record id provided doesn\'t exist', forceResponse: true};
    return next();
  }

  Clap.find({recipient: req.params.id, organisation: req.organisation._id})
  .populate('giver', '_id tag name picture')
  .populate('hashtag', '_id tag name name_translated picture')
  .sort({created: -1})
  .then(claps => {
    req.backflipRecognize = { status: 200, message: 'Claps history fetch with success.', data: claps };
    return next();
  }).catch(err => { return next(err) });
}

exports.getClapHistory = async (req, res, next) => {

  var recipient = await Record.findOne({_id: req.params.id});
  if(!recipient) {
    req.backflipRecognize = {status: 404, message: 'The record id provided doesn\'t exist', forceResponse: true};
    return next();
  }

  Clap.find({recipient: req.params.id})
  .populate('giver', '_id tag name picture')
  .populate('hashtag', '_id tag name name_translated picture')
  .sort({created: -1})
  .then(claps => {
    req.backflipRecognize = { status: 200, message: 'Claps history fetch with success.', data: claps, organisation: recipient.organisation };
    return next();
  }).catch(err => { return next(err) });
}

exports.handleMergeRecord = async (req, res, next) => {
  let recordFrom = await Record.findOne({_id: req.body.recordIdFrom});
  let recordTo = await Record.findOne({_id: req.body.recordIdTo});

  if(!recordFrom || ! recordTo) {
    req.backflipRecognize = {message: "Could not find records", status: 422, data: null};
    return next();
  }

  let clapsToUpdate = await Clap.find({hashtag: recordFrom._id});

  await asyncForEach(clapsToUpdate, async (clapToUpdate) => {
    clapToUpdate.hashtag = recordTo._id;
    await clapToUpdate.save();
  });

  req.backflipRecognize = {message: 'Claps updated with success.', status: 200, data: {clapsUpdated: clapsToUpdate}};
  return next();
}

//@todo should be in a general utils helper
let asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}