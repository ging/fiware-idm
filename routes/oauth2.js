var express = require('express');
var router = express.Router();

// OUATH2 Controller
var oauthController = require('../controllers/oauth_controller');

// Routes for Oauth2
router.get('/token',     oauthController.authenticate());
router.post('/token',    oauthController.token);
router.get('/authorize', oauthController.response_type_required, function (req, res, next) {
    if (req.session.user) {
        oauthController.logged(req, res, next)
    } else {
        oauthController.log_in(req, res, next)
    }
});
router.post('/authorize', oauthController.response_type_required, function (req, res, next) {
    if (req.session.user) {
        oauthController.authorize(req, res, next)
    } else {
        oauthController.authenticate_user(req, res, next)
    }
});

module.exports = router;