/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

const exec = require('child_process').exec;
const config_service = require('../../lib/configService.js');
config_service.set_config(require('../config-test'));
const config = config_service.get_config();
// eslint-disable-next-line no-undef
before('Create and populate database', function () {
  // Mocha default timeout for tests is 2000 and to create database is needed more
  this.timeout(10000);
  return new Promise(function (resolve, reject) {
    const create_database =
      'docker exec -i mysql mysql -u ' +
      config.database.username +
      ' -p' +
      config.database.password +
      ' -e "CREATE DATABASE IF NOT EXISTS idm_test;"';
    const load_data =
      'docker exec -i mysql mysql -u ' +
      config.database.username +
      ' -p' +
      config.database.password +
      ' idm_test < test/mysql-data/backup.sql';

    exec(create_database, function (error) {
      if (error) {
        console.log(error);
        process.exit();
        reject('Unable to create test database: ', error);
      } else {
        exec(load_data, function (error) {
          if (error) {
            console.log(error);
            process.exit();
            reject('Unable to load database: ', error);
          } else {
            // Run Keyrock
            require('../../bin/www');
            resolve('created');
          }
        });
      }
    });
  });
});

// eslint-disable-next-line no-undef
after('Delete database', function () {
  return new Promise(function (resolve, reject) {
    const load_data =
      'mysql --user=' +
      config.database.username +
      ' --password=' +
      config.database.password +
      " -e 'DROP DATABASE idm_test;'";
    exec(load_data, function (error) {
      if (error) {
        process.exit();
        reject('Unable to load database: ', error);
      } else {
        resolve('deleted');
      }
    });
  });
});
