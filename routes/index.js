var express = require('express');
var router = express.Router();

var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');

// GET Home PAge
router.get('/', function(req, res, next) {
  res.render('index', { errors: [] });
});

// Routes for users sessions
router.get('/login',		sessionController.new);
router.post('/login',		sessionController.create);
router.delete('/logout',	sessionController.destroy);

// Autoload for applicationId
router.param('applicationId', applicationController.load);

// Routes to get info about applications
router.get('/applications',  							sessionController.loginRequired,	applicationController.index);
router.get('/applications/:applicationId(\\d+)', 		sessionController.loginRequired,	applicationController.show);
router.get('/applications/new', 						sessionController.loginRequired,	applicationController.new);
router.post('/applications', 							sessionController.loginRequired,	applicationController.create);
router.get('/applications/:applicationId(\\d+)/edit', 	sessionController.loginRequired,	applicationController.edit);
router.put('/applications/:applicationId(\\d+)', 		sessionController.loginRequired,	applicationController.update);
router.delete('/applications/:applicationId(\\d+)', 	sessionController.loginRequired,	applicationController.destroy);

module.exports = router;
