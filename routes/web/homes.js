const express = require('express');
const router = express.Router();

// Home web Controller
const web_home_controller = require('../../controllers/web/index').homes;

// Routes for home
router.get('/', web_home_controller.index);
router.get('/help_about', web_home_controller.help_about);

module.exports = router;
