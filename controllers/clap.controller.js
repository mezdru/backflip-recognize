var Clap = require('../models/clap');
var Record = require('../models/record');

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
      console.log( '[CLAP WRITE] - time : ' + (dateB.getTime()-dateA.getTime()) + ' ms' );
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

  if(!record) {
    req.backflipRecognize = {status: 404, message: 'Record not found.'};
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
          claps: { $sum: "$given"},
          clapObjectCount: { $sum: 1 }
        }
      }
    ]
  ).then(clapsCount => {
    let dateB = new Date();
    console.log( '[CLAP AGGREGATION] - time : ' + (dateB.getTime()-dateA.getTime()) + ' ms' );
    req.backflipRecognize = {status: 200, message: 'Claps count fetch with success.', data: clapsCount, organisation: record.organisation};
    return next();
  }).catch(err => {return next(err)});
}