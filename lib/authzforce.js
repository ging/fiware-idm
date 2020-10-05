// Set methods to create domains in authzforce and define policies

const ejs = require('ejs');
const http = require('http');
const Promise = require('bluebird');
const uuid = require('uuid');
const config_service = require('./configService.js');
const config = config_service.get_config().authorization.authzforce;
const debug = require('debug')('idm:authzforce');
const path = require('path');

// Handle domain and policy creation
exports.handle = function (domain, role_permissions) {
  return new Promise(function (resolve, reject) {
    const get_domain = get_application_domain(domain);
    const get_policy = get_domain.then(function (az_domain) {
      return policy_set_update(
        domain.oauth_client_id,
        az_domain.domain_id,
        az_domain.version_policy,
        az_domain.policy,
        role_permissions
      );
    });
    const activate = get_policy.then(function (create) {
      return activate_policy(create.az_domain, create.policy, create.version_policy);
    });

    return Promise.all([get_domain, get_policy, activate])
      .then(function (values) {
        resolve(values);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

// Function to get authzforce domain of application
function get_application_domain(domain) {
  debug('--> get_application_domain');
  return new Promise(function (resolve, reject) {
    // See if application has an authzforce domain assigned, if not create it
    if (!domain.az_domain) {
      // Fill template with application id
      ejs.renderFile(
        path.join(__dirname, '/../templates/authzforce/domain.ejs'),
        { app_id: domain.oauth_client_id },
        function (error, body) {
          if (!error) {
            // Set headers
            const headers = {
              Accept: 'application/xml',
              'Content-Type': 'application/xml; charset=UTF-8'
            };

            // Set host and port from config file
            const options = {
              host: config.host,
              port: config.port,
              path: '/authzforce-ce/domains',
              method: 'POST',
              headers
            };

            // Send an http request to authzforce
            const req = http.request(options, function (response) {
              response.setEncoding('utf-8');

              let response_body = '';
              response.on('data', function (chunk) {
                response_body += chunk;
              });

              response.on('end', function () {
                if (response.statusCode === 200) {
                  const domain = response_body.split('href=')[1].split('"')[1];
                  resolve({
                    domain_id: domain,
                    policy: undefined,
                    version_policy: 1
                  });
                } else {
                  reject(response.statusCode);
                }
              });
            });

            // Check error in request
            req.on('error', function (error) {
              debug('Error: ', error);
              reject('Create domain: connection with authzforce failed');
            });

            // Set body of request with the filled template
            req.write(body);
            req.end();
          } else {
            reject(error);
          }
        }
      );
    } else {
      resolve({
        domain_id: domain.az_domain,
        policy: domain.policy,
        version_policy: domain.version
      });
    }
  });
}

// Function to create policy of application
function policy_set_update(application_id, az_domain, policy_version, policy, role_permissions) {
  debug('--> policy_set_update');
  return new Promise(function (resolve, reject) {
    // Info to set in template
    if (policy) {
      policy_version = policy_version + 1;
    } else {
      policy = uuid.v4();
    }

    const context = {
      role_permissions,
      app_id: application_id,
      policy_id: policy,
      version_policy: policy_version
    };

    ejs.renderFile(path.join(__dirname, '/../templates/authzforce/policy_set.ejs'), context, function (error, body) {
      if (!error) {
        // Set headers
        const headers = {
          Accept: 'application/xml',
          'Content-Type': 'application/xml; charset=utf-8'
        };

        // Set host and port from config file
        const options = {
          host: config.host,
          port: config.port,
          path: '/authzforce-ce/domains/' + az_domain + '/pap/policies',
          method: 'POST',
          headers
        };

        // Send an http request to authzforce
        const req = http.request(options, function (response) {
          response.setEncoding('utf-8');
          resolve({
            status: response.statusCode,
            az_domain,
            policy,
            version_policy: policy_version
          });
        });

        // Check error in request
        req.on('error', function (e) {
          reject('Create policy: connection with authzforce failed' + e);
        });

        // Set body of request with the filled template
        req.write(body);
        req.end();
      } else {
        reject(error);
      }
    });
  });
}

// Function to activate policy of application
function activate_policy(az_domain, policy, version_policy) {
  debug('--> activate_policy');
  return new Promise(function (resolve, reject) {
    ejs.renderFile(
      path.join(__dirname, '/../templates/authzforce/policy_properties.ejs'),
      { policy_id: policy },
      function (error, body) {
        if (!error) {
          // Set headers
          const headers = {
            Accept: 'application/xml',
            'Content-Type': 'application/xml; charset=utf-8'
          };

          // Set host and port from config file
          const options = {
            host: config.host,
            port: config.port,
            path: '/authzforce-ce/domains/' + az_domain + '/pap/pdp.properties',
            method: 'PUT',
            headers
          };

          // Send an http request to authzforce
          const req = http.request(options, function (response) {
            response.setEncoding('utf-8');
            resolve({
              status: response.statusCode,
              az_domain,
              policy,
              version_policy
            });
          });

          // Check error in request
          req.on('error', function (error) {
            debug('Error: ', error);
            reject('Activate policy: connection with authzforce failed' + error);
          });

          // Set body of request with the filled template
          req.write(body);
          req.end();
        } else {
          reject(error);
        }
      }
    );
  });
}

// Function to check connection with authzforce
exports.check_connection = function () {
  debug('--> check_connection');

  return new Promise(function (resolve, reject) {
    // Set host and port from config file
    const options = {
      host: config.host,
      port: config.port,
      path: '/authzforce-ce/domains',
      method: 'GET'
    };

    // Send an http request to authzforce
    const req = http.request(options, function (response) {
      resolve(response.statusCode);
    });

    // Check error in request
    req.on('error', function (error) {
      debug('Error: ', error);
      reject('Error: connection with Authzforce failed. Policies will not  be created');
    });

    req.end();
  });
};
