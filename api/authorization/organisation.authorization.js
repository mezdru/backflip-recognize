var express = require('express');
var router = express.Router();
var Organisation = require('../../models/organisation');
var User = require('../../models/user');

/**
 * @description Authorize access to organisation
 */
router.use((req, res, next) => {
	req.organisationId = (req.query && req.query.organisation ? req.query.organisation : null);
	next();
});

// If there is an object containing organisation id
router.use((req, res, next) => {
	if(req.organisationId) return next();

	let body = req.body;
	let bodyKeys = Object.keys(body);
	bodyKeys.forEach(key => {
		if(body[key].organisation) {
			req.organisationId = body[key].organisation;
		}
	});

	next();
});

router.use((req, res, next) => {
	if (!req.organisationId && !req.user.superadmin) return res.status(422).json({ message: 'Missing parameter, could not retrieve organisation Id.' });
	next();
});

router.use((req, res, next) => {
	if (!req.user || (req.user.email && req.user.email.value && !req.user.email.validated))
		return res.status(403).json({ message: 'Email not validated', email: (req.user ? req.user.email.value : null) });
	next();
});

router.use(function (req, res, next) {
	Organisation.findOne({ '_id': req.organisationId })
		.then(organisation => {
			if (!organisation && !req.user.superadmin) return res.status(404).json({ message: 'Organisation not found' });

			// If req.user isn't authorized user && isn't a Client
			if 	(!req.user || 
					( (req.user instanceof User) && !req.user.superadmin && !req.user.belongsToOrganisation(organisation._id) ))
				return res.status(403).json({ message: 'You haven\'t access to this Organisation.' });

			req.organisation = organisation;
			return next();
		}).catch(err => {
			return res.status(500).json({ message: 'Internal error', errors: [err] });
		});
});

module.exports = router;