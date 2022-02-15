/* eslint-env mocha */
/* eslint-disable snakecase/snakecase */

const sinon = require("sinon");

// Load test configuration
const config_service = require('../../lib/configService.js');
config_service.set_config(require('../config-test'));
const config = config_service.get_config();

const authregistry = require('../../controllers/authregistry/authregistry');
const extparticipant = require('../../controllers/extparticipant/extparticipant');
const models = require('../../models/models.js');
const utils = require('../../controllers/extparticipant/utils');

const build_mocks = function build_mocks() {
  const req = {
    headers: {
      authorization: "Bearer invalid"
    },
    method: "POST",
    is: sinon.stub().returns("application/x-www-form-urlencoded"),
    query: "",
    body: {
      "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      "client_assertion": "client_credentials"
    }
  };
  const res = {
    locals: {},
    render: sinon.spy(),
    json: sinon.spy(),
    end: sinon.spy()
  };
  res.status = sinon.stub().returns(res);
  const next = sinon.spy();

  return [req, res, next];
};


describe('External Participant Controller: ', () => {

  before(() => {
    config.pr = {
      client_id: "EU.EORI.NLHAPPYPETS"
    };
    config.ar = {
      url: "internal"
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('token endpoint', () => {

    it('should manage authorization_code grant_type', (done) => {
      const [req, res, next] = build_mocks();
      const redirect_uri = "redirect_uri";
      req.body.code = "authorization_code";
      req.body.grant_type = "authorization_code";
      req.body.redirect_uri = redirect_uri;
      sinon.stub(utils, "assert_client_using_jwt").returns(Promise.resolve([
          {iss: "EU.EORI.NLHAPPYPETS"},
          "client_certificate",
      ]));
      const code = {
        OauthClient: {id: "EU.EORI.NLHAPPYPETS"},
        expires: Date("4000-01-01"),
        extra: {
          iat: null
        },
        redirect_uri,
        scope: "openid iShare",
        save: sinon.spy(),
        User: {
        }
      };
      sinon.stub(models.oauth_authorization_code, "findOne").returns(code);
      sinon.stub(models.oauth_access_token, "create");
      sinon.stub(utils, "create_jwt")
      utils.create_jwt.onCall(0).returns("id_token");
      utils.create_jwt.onCall(1).returns("access_token");
      sinon.stub(authregistry, "get_delegation_evidence").returns(null);

      extparticipant.token(req, res, next);

      // token is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledOnce(res.json);
        sinon.assert.notCalled(next);
        sinon.assert.calledOnce(code.save);
        done();
      });
    });

    it('should manage client_credentials grant_type', (done) => {
      const [req, res, next] = build_mocks();
      req.body.grant_type = "client_credentials";
      sinon.stub(utils, "validate_participant_from_jwt").returns(Promise.resolve("EU.EORI.NLHAPPYPETS"));
      sinon.stub(utils, "assert_client_using_jwt").returns(Promise.resolve([
          {iss: "EU.EORI.NLHAPPYPETS"},
          "client_certificate",
      ]));
      sinon.stub(models.user, "upsert");
      sinon.stub(models.user, "findOne").returns({

      });
      sinon.stub(models.oauth_client, "upsert");
      sinon.stub(models.oauth_client, "findOne").returns({id: "EU.EORI.NLHAPPYPETS"});
      sinon.stub(models.oauth_access_token, "create");
      sinon.stub(utils, "create_jwt")
      utils.create_jwt.onCall(0).returns("id_token");
      utils.create_jwt.onCall(1).returns("access_token");
      sinon.stub(authregistry, "get_delegation_evidence").returns(null);

      extparticipant.token(req, res, next);

      // token is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledOnce(res.json);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should manage urn:ietf:params:oauth:grant-type:jwt-bearer grant_type', (done) => {
      const [req, res, next] = build_mocks();
      req.body.grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";
      sinon.stub(utils, "validate_participant_from_jwt").returns(Promise.resolve("EU.EORI.NLHAPPYPETS"));
      sinon.stub(utils, "assert_client_using_jwt").returns(Promise.resolve([
          {iss: "EU.EORI.NLHAPPYPETS"},
          "client_certificate",
      ]));
      sinon.stub(models.user, "upsert");
      sinon.stub(models.user, "findOne").returns({});
      sinon.stub(models.oauth_client, "upsert");
      sinon.stub(models.oauth_client, "findOne").returns({id: "EU.EORI.NLHAPPYPETS"});
      sinon.stub(models.oauth_access_token, "create");
      sinon.stub(utils, "create_jwt").returns("access_token");

      extparticipant.token(req, res, next);

      // token is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledOnce(res.json);
        sinon.assert.notCalled(next);
        done();
      });
    });

  });

});
