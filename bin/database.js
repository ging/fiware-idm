const config_service = require('../lib/configService.js');
const database = config_service.get_config().database;
const logs = config_service.get_config().debug;
const exec = require('child_process').exec;

const debug = require('debug')('idm:config_database');

// Load ORM Model
const Sequelize = require('sequelize');

// Use BBDD Mysql
const sequelize = new Sequelize(
  database.database,
  database.username,
  database.password,
  {
    host: database.host,
    dialect: database.dialect,
    logging: logs,
    //define: database.define,
    port: database.port !== 'default' ? database.port : undefined,
  }
);

sequelize
  .authenticate()
  .then(() => {
    debug('Database is already created');
    process.exit();
  })
  .catch(err => {
    // added '3D000' error code for postgres cause not referenced in dialect as 'ER_BAD_DB_ERROR'
    if (
      err.original.code === 'ER_BAD_DB_ERROR' ||
      err.original.code === '3D000'
    ) {
      exec('sequelize --env database db:create', function(error) {
        if (error) {
          debug('Unable to create database: ', err);
          process.exit();
        }

        debug('Database created');

        exec('sequelize --env database db:migrate', function(error) {
          if (error) {
            debug('Unable to migrate database: ', err);
            process.exit();
          }

          debug('Database migrated');

          exec('npm run-script seed_db', function(error) {
            if (error) {
              debug('Unable to seed database: ', error);
            }
            if (
              process.env.IDM_ADMIN_PASS === undefined ||
              process.env.IDM_ADMIN_USER === undefined ||
              process.env.IDM_ADMIN_EMAIL === undefined ||
              process.env.IDM_ADMIN_ID === undefined
            ) {
              debug(`****************
                                  WARNING: Seeding database with an admin user using default credentials. 
                                  This user must be deleted when running on a production instance");
                              ****************`);
            }
            debug('Database seeded');

            process.exit();
          });
        });
      });
    } else {
      debug('Unable to connect to the database: ', err);
      process.exit();
    }
  });
