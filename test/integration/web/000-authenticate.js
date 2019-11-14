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

describe('WEB - 0 - Authentication pages: ', function() {
  describe('1) When requesting the root page without signed in', function() {
    const auth_page = {
      url: config.host,
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) When requesting the /sign_up page without signed in', function() {
    const auth_page = {
      url: config.host + '/sign_up',
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('3) When requesting the /activate page without signed in', function() {
    const auth_page = {
      url: config.host + '/activate',
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When requesting the /password/request page without signed in', function() {
    const auth_page = {
      url: config.host + '/password/request',
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('5) When requesting the /password/rest page without signed in', function() {
    const auth_page = {
      url: config.host + '/password/reset',
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('6) When requesting the /confirmation page without signed in', function() {
    const auth_page = {
      url: config.host + '/confirmation',
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('7) When requesting a non-existing page', function() {
    const auth_page = {
      url: config.host + '/non-existing-page',
      method: 'GET',
    };

    it('should return a 404 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(404);
        done();
      });
    });
  });

  describe('8) When requesting the /auth/login page', function() {
    const auth_page = {
      url: config.host + '/auth/login',
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('9) When sending valid user credentials to /auth/login', function() {
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

  describe('10) When sending invalid user credentials to /auth/login', function() {
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

    it('should return a 302 redirect to /auth/login', function(done) {
      const auth_page = {
        url: config.host + '/auth/login',
        method: 'POST',
        json: {
          _csrf: csrf_token,
          email: 'bob-the-false-manager@test.com',
          password: 'false-test',
        },
        headers: {
          'Content-Type': 'application/json',
          cookie: csrf_headers,
        },
      };

      request(auth_page, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(302);
        response.headers.location.should.equal('/auth/login');
        done();
      });
    });
  });

  describe('11) When requesting /idm page after sign in', function() {
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

    it('should return a 302 redirect to /auth/login', function(done) {
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
