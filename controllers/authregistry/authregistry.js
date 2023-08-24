const debug = require('debug')('idm:authregistry_controller');
const Ajv = require('ajv');
const ajv = new Ajv();
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Oauth2Server = require('oauth2-server'); //eslint-disable-line snakecase/snakecase
const uuid = require('uuid');

const config_service = require('../../lib/configService.js');
const models = require('../../models/models');
const utils = require('../../controllers/extparticipant/utils');
const Request = Oauth2Server.Request;
const Response = Oauth2Server.Response;

const config = config_service.get_config();
const delegation_evidence_schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'delegationEvidenceSchema.json')));
const validate_delegation_evicence = ajv.compile(delegation_evidence_schema);
const delegation_request_schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'delegationRequestSchema.json')));
const validate_delegation_request = ajv.compile(delegation_request_schema);

// Create Oauth Server model
const oauth2 = new Oauth2Server({
  // eslint-disable new-cap
  model: require('../../models/model_oauth_server.js'),
  debug: true
});

const authenticate_bearer = async function authenticate_bearer(req) {
  const options = {};

  const request = new Request({
    headers: { authorization: req.headers.authorization },
    method: 'POST',
    query: {}
  });

  const response = new Response();

  return await oauth2.authenticate(request, response, options);
};

const get_delegation_evidence = async function get_delegation_evidence(subject) {
  const evidence = await models.delegation_evidence.findOne({
    where: {
      policy_issuer: config.pr.client_id,
      access_subject: subject
    }
  });
  return evidence == null ? null : evidence.policy;
};

const _upsert_policy = async function _upsert_policy(req, res) {
  const token_info = await authenticate_bearer(req);

  const authorized_email = `${config.pr.client_id}@${config.pr.url}`;
  if (!token_info.user.admin && token_info.user.email !== authorized_email) {
    res.status(403).json({
      error: 'You are not authorized to update policies',
      details: validate_delegation_evicence.errors
    });
    return true;
  }

  debug(`User ${token_info.user.username}`);
  if (!validate_delegation_evicence(req.body)) {
    debug(validate_delegation_evicence.errors);
    res.status(400).json({
      error: 'Invalid policy document',
      details: validate_delegation_evicence.errors
    });
    return true;
  }

  const evidence = req.body.delegationEvidence;

  // Check policyIssuer
  if (evidence.policyIssuer !== config.pr.client_id) {
    res.status(422).json({
      error: `Invalid value for policyIssuer: ${evidence.policyIssuer}`
    });
    return true;
  }

  // Create/update sent policy
  models.delegation_evidence.upsert({
    policy_issuer: evidence.policyIssuer,
    access_subject: evidence.target.accessSubject,
    policy: evidence
  });

  return res.status(200).json({});
};

const is_matching_policy = function is_matching_policy(policy_mask, policy) {
  // Check resource type
  if (policy.target.resource.type !== policy_mask.target.resource.type) {
    return false;
  }

  // Check provider
  if (policy.target.environment != null) {
    if (policy_mask.target.environment == null) {
      return false;
    }

    const service_providers_mask = policy_mask.target.environment.serviceProviders;
    const service_providers = new Set(policy.target.environment.serviceProviders);
    const all_mask_sp = service_providers_mask.every((sp) => service_providers.has(sp));
    if (!all_mask_sp) {
      return false;
    }
  }

  const resource = policy.target.resource;

  // Check identifiers
  const id_match = policy_mask.target.resource.identifiers.every((mid) => {
    return (
      (resource.identifiers.length === 1 && resource.identifiers.includes('*')) || resource.identifiers.includes(mid)
    );
  });
  if (!id_match) {
    return false;
  }

  // Check attributes
  const attributes_match = policy_mask.target.resource.attributes.every((aid) => {
    return (resource.attributes.length === 1 && resource.attributes.includes('*')) || resource.attributes.includes(aid);
  });
  if (!attributes_match) {
    return false;
  }

  // Check actions
  return (
    policy_mask.target.actions != null &&
    policy_mask.target.actions.length > 0 &&
    policy_mask.target.actions.every((mact) => {
      return (
        (policy.target.actions.length === 1 && policy.target.actions.includes('*')) ||
        policy.target.actions.includes(mact)
      );
    })
  );
};

const is_denying_permission = function is_denying_permission(policy_mask, policy) {
  return policy.rules
    .reverse()
    .some(
      (rule) =>
        rule.effect === 'Deny' &&
        rule.target.resource.type === policy_mask.target.resource.type &&
        (rule.target.resource.identifiers.includes('*') ||
          policy_mask.target.resource.identifiers.some((i) => rule.target.resource.identifiers.includes(i))) &&
        (rule.target.resource.attributes.includes('*') ||
          policy_mask.target.resource.attributes.some((a) => rule.target.resource.attributes.includes(a))) &&
        (rule.target.actions.length === 0 ||
          rule.target.actions.includes('*') ||
          policy_mask.target.actions.some((a) => rule.target.actions.includes(a)))
    );
};

const is_valid_prev_steps = async function is_valid_prev_steps(mask, user_assertion) {
  debug(`Checking previous steps user ${user_assertion}`);

  if (mask.previous_steps == null || mask.previous_steps.length === 0) {
    debug('Invalid previous step');
    return false;
  }

  debug('We got the previous step');

  // Check environment
  const policy_issuer = mask.delegationRequest.policyIssuer;
  const policy_target = mask.delegationRequest.target.accessSubject;

  let environment_provider = null;

  try {
    debug(mask.delegationRequest.policySets.length);

    for (let i = 0; i < mask.delegationRequest.policySets.length && !environment_provider; i++) {
      const policy_set = mask.delegationRequest.policySets[i];

      for (let j = 0; j < policy_set.policies.length && !environment_provider; j++) {
        const policy = policy_set.policies[j];
        if (policy.target.environment != null) {
          environment_provider = policy.target.environment.serviceProviders[0];
        }
      }
    }
  } catch (e) {
    debug(e);
    return false;
  }

  if (environment_provider !== user_assertion) {
    debug(`Invalid environment provider ${environment_provider}`);
    return false;
  }

  // Validate previous step token if provided
  const prev_step = mask.previous_steps[0];

  // Prev step must be a valid token issued by the target
  let token_info;
  try {
    // Check if the token has been issued by the policyIssuer
    debug(`Validating previous step with client ID ${policy_issuer}`);
    token_info = (await utils.validate_jwt(prev_step, policy_issuer)).payload;
  } catch (e) {
    debug(e.message);
    if (e.message.startsWith("JWT iss parameter doesn't match provided")) {
      try {
        debug(`Validating previous step with client ID ${policy_target}`);
        token_info = (await utils.validate_jwt(prev_step, policy_target)).payload;
      } catch (e) {
        debug(e.message);
        return false;
      }
    } else {
      return false;
    }
  }

  if (token_info.iss !== token_info.sub || token_info.aud !== user_assertion) {
    debug(`Invalid token aud ${token_info.aud}`);
    return false;
  }

  return true;
};

const _query_evidences = async function _query_evidences(req, res) {
  const token_info = await authenticate_bearer(req);

  debug(`Requesting delegation evidences affecing user ${token_info.user.username} (id: ${token_info.user.id})`);

  debug('Validating delegation mask structure');

  debug(JSON.stringify(req.body));

  // Validate mask structure
  if (!validate_delegation_request(req.body)) {
    debug(validate_delegation_request.errors);
    res.status(400).json({
      error: 'Invalid mask document',
      details: validate_delegation_request.errors
    });
    return true;
  }

  const mask = req.body.delegationRequest;

  // Validate user permission for requesting current mask
  // User must be the policyIssuer the policy subjet or being the evironment service provider
  let valid_prev = true;
  if (req.body.previous_steps != null) {
    valid_prev = await is_valid_prev_steps(req.body, token_info.user.username);
  }

  if (
    !valid_prev &&
    token_info.user.username !== mask.policyIssuer &&
    token_info.user.username !== mask.target.accessSubject
  ) {
    debug('Previous step is invalid ' + valid_prev);
    res.status(400).json({
      error: 'Invalid client credentials',
      details: 'The provided client credentials are not valid for the requested mask policyIssuer and target'
    });
    return true;
  }

  debug('Requesting available delegation evidences');
  debug(mask.target.accessSubject);

  const evidence = await get_delegation_evidence(mask.target.accessSubject);
  if (evidence == null) {
    debug('---- Delegation evidences not found');
    res.status(404).end();
    return true;
  }

  debug('Filtering delegation evidence using the provided mask');

  const new_policy_sets = mask.policySets.flatMap((policy_set_mask, i) => {
    debug(`Processing policy set ${i} from the providen mask`);

    return evidence.policySets.map((policy_set, j) => {
      debug(`  Processing policy set ${j} from the available delegation evidence`);

      const response_policy_set = {
        maxDelegationDepth: policy_set.maxDelegationDepth, //eslint-disable-line snakecase/snakecase
        target: policy_set.target
      };

      response_policy_set.policies = policy_set_mask.policies.map((policy_mask, z) => {
        debug(`    Processing policy ${z} from the current policy set`);
        const matching_policies = policy_set.policies.filter((policy) => is_matching_policy(policy_mask, policy));
        return {
          target: policy_mask.target,
          rules: [
            {
              effect:
                matching_policies.length === 0 || matching_policies.some((p) => is_denying_permission(policy_mask, p))
                  ? 'Deny'
                  : 'Permit'
            }
          ]
        };
      });

      return response_policy_set;
    });
  });
  evidence.policySets = new_policy_sets;

  const now = moment();
  const iat = now.unix();
  const exp = now.add(30, 'seconds').unix();
  const delegation_token = await utils.create_jwt({
    iss: config.pr.client_id,
    sub: mask.target.accessSubject,
    jti: uuid.v4(),
    iat,
    exp,
    aud: token_info.user.id,
    delegationEvidence: evidence // eslint-disable-line snakecase/snakecase
  });

  debug('Delegation evidence processed');
  res.status(200).json({ delegation_token });

  return false;
};

exports.oauth2 = oauth2;
exports.get_delegation_evidence = get_delegation_evidence;
exports.upsert_policy = function upsert_policy(req, res, next) {
  debug(' --> policy');
  _upsert_policy(req, res).then(
    (skip) => {
      if (!skip) {
        next();
      }
    },
    (err) => {
      if (err instanceof Oauth2Server.OAuthError) {
        debug('Error ', err.message);
        debug(err.status);
        debug(err.code);

        if (err.message === 'Invalid request: malformed authorization header') {
          res.status(401);
        } else {
          res.status((err.status = err.code));
        }

        if (err.details) {
          debug('Due: ', err.details);
        }

        res.locals.error = err;
        res.render('errors/oauth', {
          query: {},
          application: req.application
        });
      } else {
        res.status(500).json({
          message: err,
          code: 500,
          title: 'Internal Server Error'
        });
      }
    }
  );
};

exports.query_evidences = function query_evidences(req, res, next) {
  debug(' --> delegate');
  _query_evidences(req, res).then(
    (skip) => {
      if (!skip) {
        next();
      }
    },
    (err) => {
      if (err instanceof Oauth2Server.OAuthError) {
        debug('Error ', err.message);
        if (err.details) {
          debug('Due: ', err.details);
        }

        if (err.message === 'Invalid request: malformed authorization header') {
          res.status(401);
        } else {
          res.status(err.status);
        }

        res.locals.error = err;
        res.render('errors/oauth', {
          query: {},
          application: req.application
        });
      } else {
        res.status(500).json({
          message: err,
          code: 500,
          title: 'Internal Server Error'
        });
      }
    }
  );
};
