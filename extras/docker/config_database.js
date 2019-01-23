const database = require('../../config').database;
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
    if (err.original.code === 'ER_BAD_DB_ERROR') {
      exec('npm run-script create_db', function(error) {
        if (error) {
          debug('Unable to create database: ', error);
          process.exit();
        }

        debug('Database created');

        exec('npm run-script migrate_db', function(error) {
          if (error) {
            debug('Unable to migrate database: ', error);
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
              process.env.IDM_ADMIN_PASS === undefined
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
