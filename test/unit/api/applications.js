/*
* Copyright 2019 -  Universidad Politécnica de Madrid.
*
* This file is part of Keyrock
*
*/

// const keyrock = require('../../bin/www');
const config = require('../../../config.js');
const should = require('should');
const request = require('request');
const utils = require('../../utils');

const login = utils.readExampleFile('./test/templates/login.json').good_login;
const applications = utils.readExampleFile(
  './test/templates/api/applications.json'
);
let token;

describe('API - Applications: ', function() {
  // eslint-disable-next-line no-undef
  before(function(done) {
    const good_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: login,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return request(good_login, function(error, response) {
      token = response.headers['x-subject-token'];
      done();
    });
  });

  describe('1) When requesting list of applications', function() {
    it('should return a 200 OK', function(done) {
      const list_applications = {
        url: config.host + '/v1/applications',
        method: 'GET',
        headers: {
          'X-Auth-token': token,
        },
      };
      request(list_applications, function(error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('applications');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) When creating an application', function() {
    it('should return a 201 OK', function(done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(applications.create.valid_app_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token,
        },
      };

      request(create_application, function(error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('application');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('3) When reading application info', function() {
    it('should return a 201 OK', function(done) {
      const read_application = {
        url:
          config.host + '/v1/applications/' + applications.read.application_id,
        method: 'GET',
        headers: {
          'X-Auth-token': token,
        },
      };

      request(read_application, function(error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('application');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When creating an application', function() {
    it('should return a 201 OK', function(done) {
      const create_application = {
        url:
          config.host + '/v1/applications' + applications.update.application_id,
        method: 'PATCH',
        body: JSON.stringify(applications.update.valid_app_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token,
        },
      };

      request(create_application, function(error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('application');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });
});
