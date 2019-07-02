var express = require('express');
var router = express.Router();

var clapsApi = require('./routes/clap.api');
router.use('/claps', clapsApi);

module.exports = router;