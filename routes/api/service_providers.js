var express = require('express');
var router = express.Router();

// Service Provider API Controller
var api_serv_prov_controller = require('../../controllers/api/index').service_provider;

// Routes for service provider
router.get('/configs', api_serv_prov_controller.info)

module.exports = router;