const config_service = require('../lib/configService');
config_service.set_config(require('./config-test'), false);
const config = config_service.get_config();
const http = require('http');

const db_options = {
  timeout: 2000,
  method: 'GET',
  path: '/'
};

/* eslint-disable no-console */

let retry = 20;

function make_request(callback) {
  const request = http.request(db_options, (result) => {
    console.info(`Performed health check, result ${result.statusCode}`);
    if (result.statusCode === 200) {
      callback(0);
    } else {
      callback(1);
    }
  });
  request.on('error', (err) => {
    if (err.errno === 'ECONNREFUSED') {
      console.error(`${db_options.host}:${db_options.port} - Connection refused`);
    }
    callback(err.errno === 'ECONNREFUSED' ? 1 : 0);
  });
  request.end();
}

function connect(config, callback) {
  db_options.host = config.database.host;
  db_options.port = config.database.port || 3306;
  const connect_with_retry = () => {
    make_request((err) => {
      if (err) {
        retry--;
        if (retry === 0) {
          callback(1);
        } else {
          console.log('retry after 5 seconds.');
          //eslint-disable-next-line snakecase/snakecase
          setTimeout(connect_with_retry, 5000);
        }
      } else {
        callback();
      }
    });
  };
  connect_with_retry();
}

/**
 * Create HTTP or HTTPS server.
 */
connect(config, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.error('MySQL is up and running');
    process.exit(0);
  }
});
