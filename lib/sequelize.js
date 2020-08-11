const config_service = require('./configService.js');
config_service.set_config(require('../config'), false);
const config = config_service.get_config();

module.exports = config;
