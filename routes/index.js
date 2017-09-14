var express = require('express');
var router = express.Router();

// Create controllers
var applicationController = require('../controllers/application_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var homeController = require('../controllers/home_controller');

// GET Home PAge
router.get('/', function(req, res, next) {
	if (req.session.user) {
        res.render('home/index', {applications: []});
    } else {
    	res.render('index', { errors: [] });
    }
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

// Routes for users creation
router.get('/sign_up', 	        userController.new);
router.post('/sign_up',         userController.create);
router.get('/activate',         userController.activate);

// Autoload for applicationId
router.param('applicationId', applicationController.load);

// Route form home of user
router.get('/idm',	sessionController.loginRequired, 	homeController.index)

// Routes to get info about applications
router.get('/idm/applications',  							sessionController.loginRequired,	applicationController.index);
router.get('/idm/applications/:applicationId(\\d+)', 		sessionController.loginRequired,	applicationController.show);
router.get('/idm/applications/new', 						sessionController.loginRequired,	applicationController.new);
router.post('/idm/applications', 							sessionController.loginRequired,	applicationController.create);
router.get('/idm/applications/:applicationId(\\d+)/edit', 	sessionController.loginRequired,	applicationController.edit);
router.put('/idm/applications/:applicationId(\\d+)', 		sessionController.loginRequired,	applicationController.update);
router.delete('/idm/applications/:applicationId(\\d+)', 	sessionController.loginRequired,	applicationController.destroy);

module.exports = router;
