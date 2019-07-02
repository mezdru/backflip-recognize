var express = require('express');
var router = express.Router();
var ClapController = require('../../controllers/clap.controller');
var Authorization = require('../authorization/access.authorization');
var AuthorizationOrganisation = require('../authorization/organisation.authorization');

let passport = require('passport');
require('../passport/strategy');

const RESOURCE_MODEL = 'clap';

router.use((req, res, next) => {
  req.backflipRecognize = req.backflipRecognize || {};
  req.backflipRecognize.resource = {
    model: RESOURCE_MODEL
  }
  next();
});

router.get(
  '/:id', 
  passport.authenticate('bearer', {session: false}),
  ClapController.getSingleClap,
  Authorization.resUserOwnOnly,
)

router.get(
  '/',
  passport.authenticate('bearer', {session: false}),
  AuthorizationOrganisation,
  ClapController.getClaps,
  Authorization.resWithData
)

router.post(
  '/',
  passport.authenticate('bearer', {session: false}),
  AuthorizationOrganisation,
  ClapController.createSingleClap,
  Authorization.resWithData
)

router.put(
  '/:id',
  passport.authenticate('bearer', {session: false}),
  AuthorizationOrganisation,
  Authorization.userOwnsOnly,
  // RecordController.updateSingleRecord,
  // Authorization.resWithData 
)

router.delete(
  '/:id',
  passport.authenticate('bearer', {session: false}),
  // AuthorizationOrganisation,
  // Authorization.userOwnsRecordOnly,
  // // ...
  // Authorization.resWithData
)

module.exports = router;