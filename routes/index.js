var express = require('express');
var router = express.Router();

var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');

// GET Home PAge
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fiware IDM', errors: [] });
});

// Autoload for applicationId
router.param('applicationId', applicationController.load);

// Routes for users sessions
router.get('/login',		sessionController.new);
router.post('/login',		sessionController.create);
router.delete('/logout',	sessionController.destroy);

// Routes to get info about applications
router.get('/indexApplication', 								applicationController.index);
router.get('/indexApplication/:applicationId(\\d+)', 			applicationController.show);
router.get('/indexApplication/new', 							applicationController.new);
router.post('/indexApplication/create', 						applicationController.create);
router.get('/indexApplication/:applicationId(\\d+)/edit', 		applicationController.edit);
router.put('/indexApplication/:applicationId(\\d+)', 			applicationController.update);
router.delete('/indexApplication/:applicationId(\\d+)', 		applicationController.destroy);

module.exports = router;
