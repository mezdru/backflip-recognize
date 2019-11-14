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

// obsolete
router.get(
  '/record/:id/count',
  passport.authenticate('bearer', {session: false}),
  ClapController.getRecordHashtagsClapsSum,
  ResponseAuthorization.resForUserGrantedOnly
)

let Organisation = require('../../models/organisation');

router.get(
  '/organisation/:orgId/record/:id/count',
  async (req, res, next) => {
    req.organisation = await Organisation.findOne({_id: req.params.orgId}).catch(e => null);
    if(req.organisation && req.organisation.public) {
      return next();
    } else {
      return passport.authenticate('bearer', {session: false})(req, res, next);
    }
  },
  ClapController.getRecordHashtagsClapsSum2,
  ResponseAuthorization.resAllowedToReadOrganisationOnly
)


router.get(
  '/organisation/:orgId/record/:id',
  async (req, res, next) => {
    req.organisation = await Organisation.findOne({_id: req.params.orgId}).catch(e => null);
    if(req.organisation && req.organisation.public) {
      return next();
    } else {
      return passport.authenticate('bearer', {session: false})(req, res, next);
    }
  },
  ClapController.getClapHistory2,
  ResponseAuthorization.resAllowedToReadOrganisationOnly
);

// obsolete
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

router.put(
  '/notify/merge',
  passport.authenticate('bearer', {session: false}),
  ResponseAuthorization.clientOnly,
  ClapController.handleMergeRecord,
  ResponseAuthorization.resForAllUser
)

module.exports = router;