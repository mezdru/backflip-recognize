var express = require('express');
var router = express.Router();
var ClapController = require('../../controllers/clap.controller');
var ResponseAuthorization = require('../authorization/response.authorization');
var AuthorizationOrganisation = require('../authorization/organisation.authorization');
var ClapValidation = require('../validation/clap.validation');

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
  '/record/:id/count',
  passport.authenticate('bearer', {session: false}),
  ClapController.getRecordHashtagsClapsSum,
  ResponseAuthorization.resForUserGrantedOnly
)

router.get(
  '/record/:id',
  passport.authenticate('bearer', {session: false}),
  ClapController.getClapHistory,
  ResponseAuthorization.resForUserGrantedOnly
)

router.get(
  '/organisations',
  passport.authenticate('bearer', {session: false}),
  ResponseAuthorization.superadminOnly,
  ClapController.getOrganisationsClapsSum,
  ResponseAuthorization.resForSuperadminOnly
)

router.get(
  '/:id', 
  passport.authenticate('bearer', {session: false}),
  ClapController.getSingleClap,
  ResponseAuthorization.resForUserGrantedOnly,
)

router.get(
  '/',
  passport.authenticate('bearer', {session: false}),
  AuthorizationOrganisation,
  ClapController.getClaps,
  ResponseAuthorization.resForAllUser
)

router.post(
  '/',
  passport.authenticate('bearer', {session: false}),
  AuthorizationOrganisation,
  ClapValidation,
  ClapController.createSingleClap,
  ClapController.scheduleRecognizeEmail,
  ResponseAuthorization.resForAllUser
)

module.exports = router;