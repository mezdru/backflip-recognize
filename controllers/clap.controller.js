var Clap = require('../models/clap');

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
  Clap.findOne({_id: req.params.id})
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
  if(!req.body.clap) {
    req.backflipRecognize = {message: 'Missing body parameter: clap', status: 422};
    return next();
  }

  let clap = new Clap(req.body.clap);
  clap.owner =  req.user._id;

  clap.save()
  .then(clapSaved => {
    req.backflipRecognize = {message: 'Clap saved with success', status: 200, data: clapSaved};
    return next();
  }).catch(err => {
    if(err.name === 'ValidationError') {
      req.backflipRecognize = {message: err.message, status: 422};
      return next();
    }
    return next(err);
  });
}