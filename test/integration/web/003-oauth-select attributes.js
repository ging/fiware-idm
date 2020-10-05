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

describe('WEB - 0 - OAuth choosen attributes: ', function() {
  // Before todos hay que crear un usuario con attributos hidden y otro que no

  describe('1) When request user info of a token to /oauth2/token', function() {
    it('should only return shared_attributes', function(done) {
      done();
    });
  });
});
