/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

// // Dom parser
// const jsdom = require('jsdom');
//
// // eslint-disable-next-line snakecase/snakecase
// const { JSDOM } = jsdom;
//
// // const keyrock = require('../../bin/www');
// const config = require('../../../config.js');
// const should = require('should');
// const request = require('request');

describe('WEB - 0 - Third party applications page: ', function() {
  // Before todos hay que crear un usuario con algunas aplicaciones autorizadas

  describe('1) When request to /idm/users/<user_id>/_third_party_applications with a user with authorized apps', function() {
    it('should return a 200 Ok', function(done) {
      done();
    });

    it('should show 2 panels', function(done) {
      done();
    });
  });

  describe('2) When request to /idm/users/<user_id>/_third_party_applications with a user without authorized apps', function() {
    it('should return a 200 Ok', function(done) {
      done();
    });

    it('should show not show any panel', function(done) {
      done();
    });
  });

  describe('3) When delete an authorized application', function() {
    it('should return a 200 Ok', function(done) {
      done();
    });

    it('should redirect to /idm/users/admin/_third_party_applications', function(done) {
      done();
    });
  });
});
