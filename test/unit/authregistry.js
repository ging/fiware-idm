/* eslint-env mocha */
/* eslint-disable snakecase/snakecase */

const moment = require('moment');
const sinon = require("sinon");

// Load test configuration
const config_service = require('../../lib/configService.js');
config_service.set_config(require('../config-test'));
const config = config_service.get_config();
const uuid = require('uuid');

const models = require('../../models/models.js');
const authregistry = require("../../controllers/authregistry/authregistry");
const utils = require("../../controllers/extparticipant/utils");


const USER1 = {
  user: {
    id: "930439c2-4259-4da3-be65-ea12b75aa425",
    username: "aarranz",
    admin: true
  }
};
Object.freeze(USER1);

const DELEGATION_MASK1 = {
  delegationRequest: {
    policyIssuer: "EU.EORI.NLHAPPYPETS",
    target: {
      accessSubject: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc"
    },
    policySets: [{
      policies: [{
        target: {
          resource: {
            type: "GS1.CONTAINER",
            identifiers: ["180621.ABC1234"],
            attributes: ["GS1.CONTAINER.ATTRIBUTE.ETA"]
          },
          actions: ["ISHARE.READ"],
          environment: {
            serviceProviders: ["EU.EORI.NL000000003"]
          }
        },
        rules: [
          {
            effect: "Permit"
          }
        ]
      }]
    }]
  }
};
Object.freeze(DELEGATION_MASK1);

const DELEGATION_MASK2 = {
  delegationRequest: {
    policyIssuer: "EU.EORI.NLHAPPYPETS",
    target: {
      accessSubject: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc"
    },
    policySets: [{
      policies: [{
        target: {
          resource: {
            type: "DELIVERYORDER",
            identifiers: ["180621.ABC1234"],
            attributes: ["ETA"]
          },
          actions: ["GET"]
        },
        rules: [
          {
            effect: "Permit"
          }
        ]
      }]
    }]
  }
};
Object.freeze(DELEGATION_MASK2);

const DELEGATION_EVIDENCE1 = {
  notBefore: 1541058939,
  notOnOrAfter: 2147483647,
  policyIssuer: "EU.EORI.NLHAPPYPETS",
  target: {
    accessSubject: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc"
  },
  policySets: [
    {
      maxDelegationDepth: 1,
      target: {
        environment: {
          licenses: ["ISHARE.0001"]
        }
      },
      policies: [
        {
          target: {
            resource: {
              type: "DELIVERYORDER",
              identifiers: ["*"],
              attributes: ["*"]
            },
            actions: ["GET"]
          },
          rules: [{
            effect: "Permit"
          }]
        }
      ]
    }
  ]
};

const build_mocks = function build_mocks() {
  const req = {
    headers: {
      authorization: "Bearer invalid"
    },
    method: "POST",
    query: "",
    body: {}
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

describe('Authorization Registry: ', () => {

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

  describe('upsert_policy', () => {

    it('should report internal errors', (done) => {
      const [req, res, next] = build_mocks();
      const error = new Error();
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.reject(error));

      authregistry.upsert_policy(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledOnce(res.json);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should complain about invalid auth token', (done) => {
      const [req, res, next] = build_mocks();
      const error = new authregistry.oauth2.constructor.UnauthorizedRequestError();
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.reject(error));

      authregistry.upsert_policy(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        res.status.calledOnceWithExactly(401);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should complain about invalid policy payloads', (done) => {
      const [req, res, next] = build_mocks();
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.resolve(USER1));

      authregistry.upsert_policy(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 400);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should store new delegation evidences', (done) => {
      const [req, res, next] = build_mocks();
      req.body = {
        delegationEvidence: DELEGATION_EVIDENCE1
      };
      sinon.stub(models.user, "findOne").returns(Promise.resolve(USER1));
      sinon.stub(models.delegation_evidence, "upsert");
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.resolve(USER1));

      authregistry.upsert_policy(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(models.delegation_evidence.upsert);
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledOnce(next);
        done();
      });
    });

  });

  describe('query_evidences', () => {

    it('should report internal errors', (done) => {
      const [req, res, next] = build_mocks();
      const error = new Error();
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.reject(error));

      authregistry.query_evidences(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledOnce(res.json);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should complain about invalid auth token', (done) => {
      const [req, res, next] = build_mocks();
      const error = new authregistry.oauth2.constructor.UnauthorizedRequestError();
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.reject(error));

      authregistry.query_evidences(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 401);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should complain about invalid delegation payloads', (done) => {
      const [req, res, next] = build_mocks();
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.resolve(USER1));

      authregistry.query_evidences(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 400);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should return 404 if there is not delegation evidence', (done) => {
      const [req, res, next] = build_mocks();
      req.body = DELEGATION_MASK1;
      sinon.stub(models.delegation_evidence, "findOne").returns(null);
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.resolve(USER1));

      authregistry.query_evidences(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 404);
        sinon.assert.notCalled(next);
        done();
      });
    });

    it('should return delegation evidences when there are not matching policies', (done) => {
      const [req, res, next] = build_mocks();
      req.body = DELEGATION_MASK1;
      sinon.stub(models.delegation_evidence, "findOne").returns({
          policy: JSON.parse(JSON.stringify(DELEGATION_EVIDENCE1))
      });
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.resolve(USER1));
      sinon.stub(utils, "create_jwt").returns(Promise.resolve("generated_jwt"));
      sinon.stub(uuid, "v4").returns("73a791c0-e9cc-4e13-bd5e-2fe03cde2a8a");
      const moment_mock = sinon.stub(moment.prototype, "unix");
      moment_mock.onCall(0).returns(1633947564);
      moment_mock.onCall(1).returns(1633947594);

      authregistry.query_evidences(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledOnce(next);
        sinon.assert.calledWith(utils.create_jwt, {
          exp: 1633947594,
          iat: 1633947564,
          iss: "EU.EORI.NLHAPPYPETS",
          jti: "73a791c0-e9cc-4e13-bd5e-2fe03cde2a8a",
          sub: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc",
          aud: "930439c2-4259-4da3-be65-ea12b75aa425",
          delegationEvidence: {
            notBefore: 1541058939,
            notOnOrAfter: 2147483647,
            policyIssuer: "EU.EORI.NLHAPPYPETS",
            policySets: [{
              maxDelegationDepth: 1,
              policies: [{
                // effect is Deny due no policy match
                rules: [{ effect: "Deny" }],
                target: {
                  actions: ["ISHARE.READ"],
                  environment: { serviceProviders: ["EU.EORI.NL000000003"] },
                  resource: {
                    attributes: ["GS1.CONTAINER.ATTRIBUTE.ETA"],
                    identifiers: ["180621.ABC1234"],
                    type: "GS1.CONTAINER"
                  }
                }
              }],
              target: { environment: { licenses: ["ISHARE.0001"] } }
            }],
            target: { accessSubject: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc" }
          }
        });
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, {
          delegation_token: "generated_jwt"
        });
        done();
      });
    });

    it('should return delegation evidences when there are matching policies', (done) => {
      const [req, res, next] = build_mocks();
      req.body = DELEGATION_MASK2;
      sinon.stub(models.delegation_evidence, "findOne").returns({
          policy: JSON.parse(JSON.stringify(DELEGATION_EVIDENCE1))
      });
      sinon.stub(authregistry.oauth2, "authenticate").returns(Promise.resolve(USER1));
      sinon.stub(utils, "create_jwt").returns(Promise.resolve("generated_jwt"));
      sinon.stub(uuid, "v4").returns("73a791c0-e9cc-4e13-bd5e-2fe03cde2a8a");
      const moment_mock = sinon.stub(moment.prototype, "unix");
      moment_mock.onCall(0).returns(1633947564);
      moment_mock.onCall(1).returns(1633947594);

      authregistry.query_evidences(req, res, next);

      // query_evidences is asynchronous so wait request is processed
      setTimeout(() => {
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledOnce(next);
        sinon.assert.calledWith(utils.create_jwt, {
          exp: 1633947594,
          iat: 1633947564,
          iss: "EU.EORI.NLHAPPYPETS",
          jti: "73a791c0-e9cc-4e13-bd5e-2fe03cde2a8a",
          sub: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc",
          aud: "930439c2-4259-4da3-be65-ea12b75aa425",
          delegationEvidence: {
            notBefore: 1541058939,
            notOnOrAfter: 2147483647,
            policyIssuer: "EU.EORI.NLHAPPYPETS",
            policySets: [{
              maxDelegationDepth: 1,
              policies: [{
                rules: [{ effect: "Permit" }],
                target: {
                  actions: ["GET"],
                  resource: {
                    attributes: ["ETA"],
                    identifiers: ["180621.ABC1234"],
                    type: "DELIVERYORDER"
                  }
                }
              }],
              target: { environment: { licenses: ["ISHARE.0001"] } }
            }],
            target: { accessSubject: "1b49be31-ecd4-4a52-8a99-502ba8f24ecc" }
          }
        });
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, {
          delegation_token: "generated_jwt"
        });
        done();
      });
    });

  });

});
