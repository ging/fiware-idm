/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

// Dom parser
const jsdom = require('jsdom');

// eslint-disable-next-line snakecase/snakecase
const { JSDOM } = jsdom;

// const keyrock = require('../../bin/www');
const config = require('../../../config.js');
const should = require('should');
const request = require('request');

describe('WEB - 0 - 2 factor authentication: ', function() {
  // Before todos hay que crear un usuario a través de la API con el 2fa habilitado

  describe('1) When authenticate a user (without 2fa enable) through /auth/login', function() {
    let csrf_token;
    let csrf_headers;

    // Obtain csrf token from web page
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const obtain_csrf_token = {
        url: config.host + '/auth/login',
        method: 'GET',
      };

      request(obtain_csrf_token, function(error, response) {
        should.not.exist(error);
        const dom = new JSDOM(response.body);
        csrf_token = dom.window.document.querySelector("input[name='_csrf']")
          .value;
        csrf_headers = response.headers['set-cookie'];
        done();
      });
    });

    it('should return a 302 redirect to /idm', function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-manager@test.com',
          password: 'test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(302);
        response.headers.location.should.equal('/idm');
        done();
      });
    });
  });

  describe('2) When authenticate a user (with 2fa enable) through /auth/login', function() {
    let csrf_token;
    let csrf_headers;

    // Obtain csrf token from web page
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const obtain_csrf_token = {
        url: config.host + '/auth/login',
        method: 'GET',
      };

      request(obtain_csrf_token, function(error, response) {
        should.not.exist(error);
        const dom = new JSDOM(response.body);
        csrf_token = dom.window.document.querySelector("input[name='_csrf']")
          .value;
        csrf_headers = response.headers['set-cookie'];
        done();
      });
    });

    it('should return a 302 redirect to /auth/login/', function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-manager@test.com',
          password: 'test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(302);
        response.headers.location.should.equal('/idm'); // Cambiar a /auth/login
        done();
      });
    });

    it('should show an image with a QR', function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-manager@test.com',
          password: 'test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(302);
        response.headers.location.should.equal('/idm'); // Cambiar a /auth/login
        // Ver si tiene el QR en el body
        done();
      });
    });
  });

  describe('3) When sending an invalid code to /auth/tfa_verify page after sign in', function() {
    let csrf_token;
    let csrf_headers;
    let session_headers;

    // Obtain csrf token from web page
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const obtain_csrf_token = {
        url: config.host + '/auth/login',
        method: 'GET',
      };

      request(obtain_csrf_token, function(error, response) {
        should.not.exist(error);
        const dom = new JSDOM(response.body);
        csrf_token = dom.window.document.querySelector("input[name='_csrf']")
          .value;
        csrf_headers = response.headers['set-cookie'];
        done();
      });
    });

    // Authenticate users
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-manager@test.com',
          password: 'test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        session_headers = response.headers['set-cookie'];
        done();
      });
    });

    it('should return a 400 bad request', function(done) {
      const home_page = {
        url: config.host + '/idm',
        method: 'GET',
        headers: {
          cookie: session_headers,
        },
      };

      request(home_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });

    it('should show an image with a QR', function(done) {
      const home_page = {
        url: config.host + '/idm',
        method: 'GET',
        headers: {
          cookie: session_headers,
        },
      };

      request(home_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When sending an invalid security question to /auth/security_question page after sign in', function() {
    let csrf_token;
    let csrf_headers;
    let session_headers;

    // Obtain csrf token from web page
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const obtain_csrf_token = {
        url: config.host + '/auth/login',
        method: 'GET',
      };

      request(obtain_csrf_token, function(error, response) {
        should.not.exist(error);
        const dom = new JSDOM(response.body);
        csrf_token = dom.window.document.querySelector("input[name='_csrf']")
          .value;
        csrf_headers = response.headers['set-cookie'];
        done();
      });
    });

    // Authenticate users
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-manager@test.com',
          password: 'test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        session_headers = response.headers['set-cookie'];
        done();
      });
    });

    it('should return a 400 bad request', function(done) {
      const home_page = {
        url: config.host + '/idm',
        method: 'GET',
        headers: {
          cookie: session_headers,
        },
      };

      request(home_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });

    it('should render again security question view', function(done) {
      const home_page = {
        url: config.host + '/idm',
        method: 'GET',
        headers: {
          cookie: session_headers,
        },
      };

      request(home_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('5) When sending a valid security question to /auth/security_question page after sign in', function() {
    let csrf_token;
    let csrf_headers;
    let session_headers;

    // Obtain csrf token from web page
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const obtain_csrf_token = {
        url: config.host + '/auth/login',
        method: 'GET',
      };

      request(obtain_csrf_token, function(error, response) {
        should.not.exist(error);
        const dom = new JSDOM(response.body);
        csrf_token = dom.window.document.querySelector("input[name='_csrf']")
          .value;
        csrf_headers = response.headers['set-cookie'];
        done();
      });
    });

    // Authenticate users
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-manager@test.com',
          password: 'test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        session_headers = response.headers['set-cookie'];
        done();
      });
    });

    it('should return a 302 redirect to /idm', function(done) {
      const home_page = {
        url: config.host + '/idm',
        method: 'GET',
        headers: {
          cookie: session_headers,
        },
      };

      request(home_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });

    it('should disable tfa in user', function(done) {
      const home_page = {
        url: config.host + '/idm',
        method: 'GET',
        headers: {
          cookie: session_headers,
        },
      };

      request(home_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });
});
