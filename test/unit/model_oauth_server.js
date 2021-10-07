/* eslint-env mocha */

require('should');
const sinon = require("sinon");

// Load test configuration
const config_service = require('../../lib/configService.js');
config_service.set_config(require('../config-test'));

const model_oauth_server = require('../../models/model_oauth_server.js');

describe('OAuth Server: ', () => {

  afterEach(() => {  // eslint-disable-line snakecase/snakecase
    sinon.restore();
  });

  describe('validateScope(user, client, scope)', () => {

    describe('should return bearer scope', () => {
      const test = (label, value) => {
        it(`when providing ${label} as scope`, () => {
          const result = model_oauth_server.validateScope(null, null, value);
          result.should.be.eql(['bearer']);
        });
      };

      test('null', null);
      test('""', "");
      test('[]', []);
    })

    describe('should return false', () => {
      const test = (label, value, client) => {
        it(label, () => {
          const result = model_oauth_server.validateScope(null, client, value);
          result.should.be.eql(false);
        });
      };

      test('when using bearer and jwt scopes at the same time (comma-separated string)', "bearer,jwt");
      test('when using bearer and jwt scopes at the same time (comma-separated string, extra scopes)', "openid,bearer,jwt,profile");
      test('when using bearer and jwt scopes at the same time (whitespace-separated string)', "bearer jwt");
      test('when using bearer and jwt scopes at the same time (whitespace-separated string, extra scopes)', "openid bearer jwt profile");

      // Permanent tokens not enabled 
      test('when using permanent scope on a client not supporting permanent tokens', "permanent", {token_types: ["bearer"]});
      test('when using permanent scope on a client not supporting permanent tokens (comma-separated string, extra scopes)', "openid,permanent,jwt", {token_types: ["bearer"]});
      test('when using permanent scope on a client not supporting permanent tokens (whitespace-separated string, extra scopes)', "openid permanent bearer", {token_types: ["bearer"]});

      // JWT tokens not enabled
      test('when using jwt scope on a client not supporting jwt tokens', "jwt", {token_types: ["bearer"]});
      test('when using jwt scope on a client not supporting jwt tokens (comma-separated string, extra scopes)', "openid,jwt,profile", {token_types: ["bearer"]});
      test('when using jwt scope on a client not supporting jwt tokens (whitespace-separated string, extra scopes)', "openid jwt profile", {token_types: ["bearer"]});

      // OpenID Connect tokens not enabled
      test('when using openid scope on a client not supporting openid tokens', "openid", {scope: []});
      test('when using openid scope on a client not supporting openid tokens (comma-separated string, extra scopes)', "email,openid,profile", {scope: []});
      test('when using openid scope on a client not supporting openid tokens (whitespace-separated string, extra scopes)', "email openid profile", {scope: []});
    })

    describe('should return the provided scopes if they are valid', () => {
      const test = (label, value, client, expected) => {
        it(`when providing ${label} as scope`, () => {
          const result = model_oauth_server.validateScope(null, client, value);
          result.should.be.eql(expected);
        });
      };

      test('basic permanent token', 'permanent', {token_types: ["permanent"]}, ["permanent"]);
      test('basic jwt token', 'jwt', {token_types: ["jwt"]}, ["jwt"]);
      test('basic openid token', 'openid', {scope: ["openid"]}, ["openid"]);
      test('openid + jwt', 'openid jwt', {scope: ["openid"], token_types: ["jwt"]}, ["openid", "jwt"]);
      test('openid + permanent', 'openid permanent', {scope: ["openid"], token_types: ["permanent"]}, ["openid", "permanent"]);
      test('openid + permanent + jwt', 'openid permanent jwt', {scope: ["openid"], token_types: ["jwt", "permanent"]}, ["openid", "permanent", "jwt"]);
      test('openid + profile', 'openid profile', {scope: ["openid"]}, ["openid", "profile"]);
    })

  });

});
