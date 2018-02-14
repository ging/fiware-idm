var express = require('express');
var router = express.Router();

// API Controller
var apiController = require('../controllers/api/index');

router.post('/auth/tokens', apiController.authenticate.create_token);

router.get('/applications', apiController.authenticate.validate_token, apiController.application.info);

module.exports = router;