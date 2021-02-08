const express = require('express');
const router = express.Router();

// Service Provider API Controller
const api_serv_prov_controller = require('../../controllers/api/index').service_provider;
const api_user_controller = require('../../controllers/api/index').users;

// Routes for service provider
router.get('/configs', api_user_controller.check_admin, api_serv_prov_controller.info);

module.exports = router;
