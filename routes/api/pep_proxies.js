var express = require('express');
var router = express.Router();

// Pep Proxy API Controller
var api_peppx_controller = require('../../controllers/api/index').pep_proxies;

router.all('*', api_peppx_controller.search_pep_proxy)

// Routes for pep_proxies
router.get('/', 	api_peppx_controller.info);
router.post('/', 	api_peppx_controller.create);
router.patch('/', 	api_peppx_controller.update);
router.delete('/', 	api_peppx_controller.delete);

module.exports = router;