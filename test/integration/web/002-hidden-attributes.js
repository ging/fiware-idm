/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

// Dom parser
// const jsdom = require('jsdom');
//
// // eslint-disable-next-line snakecase/snakecase
// const { JSDOM } = jsdom;
//
// // const keyrock = require('../../bin/www');
// const config = require('../../../config.js');
// const should = require('should');
// const request = require('request');

describe('WEB - 0 - Hidden attributes: ', function() {
  // Before todos hay que crear un usuario con attributos hidden y otro que no

  describe('1) When request to /idm/users/<user_id> with a user with description attribute hidden', function() {
    it('should return a 200 Ok', function(done) {
      done();
    });

    it('should show not show description', function(done) {
      done();
    });
  });

  describe('2) When request to /idm/users/<user_id> with a user with description attribute visible', function() {
    it('should return a 200 Ok', function(done) {
      done();
    });

    it('should show show description', function(done) {
      done();
    });
  });
});
