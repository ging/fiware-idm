var express = require('express');
var router = express.Router();

// Authentication API controller
var api_authenticate_controller = require('../../controllers/api/index').authenticate;

// Routes for authentication
router.post('/tokens', 		api_authenticate_controller.create_token);
router.get('/tokens', 		api_authenticate_controller.info_token);
router.delete('/tokens', 	api_authenticate_controller.delete_token);

module.exports = router;