const config_service = require('./configService.js');
const config = config_service.get_config();

module.exports = config;
