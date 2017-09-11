var express = require('express');
var router = express.Router();

var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');

// GET Home PAge
router.get('/', function(req, res, next) {
  res.render('index', { errors: [] });
});

router.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }       
    next(); 
});

// Routes for users sessions
router.get('/auth/login',		sessionController.new);
router.post('/auth/login',		sessionController.create);
router.delete('/auth/logout',	sessionController.destroy);

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
