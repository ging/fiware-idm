const exec = require('child_process').exec;
const Sequelize = require('sequelize');
const config_service = require('./configService.js');
const logs = require('../config.js').debug;

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
    migrate_database(function (error) {
      if (error) {
        return callback(error);
      }
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

function migrate_database(callback) {
  exec('npm run migrate_db --silent', function (error) {
    if (error) {
      console.error('Unable to migrate database: ', error);
      return callback(error);
    }
    console.info('Database migrated');
    callback();
  });
}

function make_request(callback) {

  const database = config_service.get_config().database;
  const sequelize = new Sequelize(database.database, database.username, database.password, {
    host: database.host,
    logging: logs,
    port: database.port,
    dialect: database.dialect
  });

  sequelize
    .authenticate()
    .then(() => {
      console.info('Connection has been established successfully');
      callback(0);
    })
    .catch((err) => {
      if(err.parent.fatal){
        console.warn(`WARNING: Connection refused - ${database.host}:${database.port || 3306} - ${err.parent.code} `);
        callback(1);
      } else if(err.parent.code === 'ER_BAD_DB_ERROR'){
        console.warn(`WARNING: Connected, but DB not initialized  - ${err.parent.sqlMessage}`);
        callback(0);
      } else {
        console.error(`ERROR: Unexpected error - ${err.parent.code}`);
        callback(1);
      }
    });
}

function connect(config, callback) {
  const connect_with_retry = () => {
    make_request((err) => {
      if (err) {
        retry--;

        if (retry === 0) {
          console.error('FATAL: Unable to connect after multiple attempts. Exiting');
          process.exit(1);
        } else {
          console.info('Info: Retrying after 5 seconds.');
          //eslint-disable-next-line snakecase/snakecase
          setTimeout(connect_with_retry, 5000);
        }
      } else if (process.env.IDM_DB_MIGRATE === 'true') {
        // Run Database migration
        migrate_database((err) => {
          callback(err);
        });
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
