var express = require('express');
var router = express.Router();

// Pep Proxy API Controller
var api_peppx_controller = require('../../controllers/api/index').pep_proxies;

// Routes for pep_proxies
router.get('/', 				api_peppx_controller.index);
router.post('/', 				api_peppx_controller.create);
router.get('/:pep_proxyId', 	api_peppx_controller.info);
router.patch('/:pep_proxyId', 	api_peppx_controller.update);
router.delete('/:pep_proxyId', 	api_peppx_controller.delete);

module.exports = router;