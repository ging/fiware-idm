const exec = require('child_process').exec;
const http = require('http');
const db_options = {
  timeout: 2000,
  method: 'GET',
  path: '/'
};

/* eslint-disable no-console */

let retry = 20;

function default_admin_check() {
  if (
    process.env.IDM_ADMIN_PASS === undefined ||
    process.env.IDM_ADMIN_USER === undefined ||
    process.env.IDM_ADMIN_EMAIL === undefined ||
    process.env.IDM_ADMIN_ID === undefined
  ) {
    console.warn('****************');
    console.warn('WARNING: Seeding database with an admin user using default credentials.');
    console.warn('This user must be deleted when running on a production instance');
    console.warn('****************');
  }
}

/* eslint-disable consistent-return */
function make_database(callback) {
  exec('npm run create_db --silent', function (error) {
    if (error) {
      console.error('Unable to create database: ', error);
      return callback(error);
    }
    console.info('Database created');
    exec('npm run migrate_db --silent', function (error) {
      if (error) {
        console.error('Unable to migrate database: ', error);
        return callback(error);
      }

      console.info('Database migrated');
      exec('npm run seed_db --silent', function (error) {
        if (error) {
          console.error('Unable to seed database: ', error);
          return callback(error);
        }

        console.info('Database seeded');
        default_admin_check();
        return callback();
      });
    });
  });
}

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
          process.exit(1);
        } else {
          console.log('retry after 5 seconds.');
          //eslint-disable-next-line snakecase/snakecase
          setTimeout(connect_with_retry, 5000);
        }
      } else if (process.env.IDM_DB_SEED === 'true') {
        // Create and seed the Database
        make_database((err) => {
          callback(err);
        });
      } else {
        // Do not seed the database
        callback();
      }
    });
  };
  connect_with_retry();
}

module.exports = {
  connect
};
