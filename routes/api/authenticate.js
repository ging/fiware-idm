var express = require('express');
var router = express.Router();

// Authentication API controller
var api_authenticate_controller = require('../../controllers/api/index').authenticate;

// Routes for authentication
router.post('/tokens', api_authenticate_controller.create_token);

// GET /auth/tokens para validar un token que sera oauth lo mas seguro y obtener informacion
// HEAD /auth/tokens para validar un token que sera oauth lo mas seguro sin mas 
// DELETE /auth/tokens para revoke a token

module.exports = router;