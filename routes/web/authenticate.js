var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: false })
var parseForm = bodyParser.urlencoded({ extended: false })

// Home web Controller
var web_session_controller = require('../../controllers/web/index').sessions;

// Routes for users sessions
router.get('/login',	   csrfProtection,     web_session_controller.new);
router.post('/login',      parseForm,  csrfProtection,     web_session_controller.create);
router.delete('/logout',   web_session_controller.destroy);

module.exports = router;