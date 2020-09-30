const config_service = require('./configService.js');
const config_usage_control = config_service.get_config().usage_control;
const http = require('http');
const parse_to_camel_case = require('camelcase');
const debug = require('debug')('idm:ptp');

const times_seconds = {
  SECONDS: 1, // eslint-disable-line snakecase/snakecase
  MINUTES: 60, // eslint-disable-line snakecase/snakecase
  HOURS: 3600, // eslint-disable-line snakecase/snakecase
  DAYS: 86400 // eslint-disable-line snakecase/snakecase
};

exports.submit_policies = function (application_id, previous_job_id, submit_ptp) {
  debug('--> submit_policies');

  return new Promise(function (resolve, reject) {
    const body = JSON.stringify(parse_body_request(application_id, previous_job_id, submit_ptp));

    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    };

    // Set host and port from config file
    const options = {
      host: config_usage_control.ptp.host,
      port: config_usage_control.ptp.port,
      method: 'POST',
      headers
    };

    // Send an http request to authzforce
    const req = http.request(options, function (response) {
      response.setEncoding('utf-8');

      response.on('data', function () {});

      response.on('end', function () {
        debug('------PTP--------', response.statusCode);
        resolve();
      });
    });

    // Check error in request
    req.on('error', function (error) {
      debug('Error: ', error);
      reject('Error create policies: connection with ptp failed');
    });

    // Set body of request with the filled template
    req.write(body);
    req.end();
  });
};

function parse_body_request(application_id, previous_job_id, submit_ptp) {
  const submit_policies = JSON.parse(JSON.stringify(require('../templates/ptp/policies.json')));
  submit_policies.id = application_id;
  submit_policies.previousJobId = previous_job_id ? previous_job_id : '';
  for (let i = 0; i < submit_ptp.length; i++) {
    const rule = JSON.parse(JSON.stringify(require('../templates/ptp/rule.json')));
    rule.rule.type = submit_ptp[i].type;
    if (submit_ptp[i].parameters) {
      let param;
      for (param in submit_ptp[i].parameters) {
        const param_camel_case = parse_to_camel_case(param, {
          pascalCase: false // eslint-disable-line snakecase/snakecase
        });
        if (param === 'aggregate_time') {
          rule.rule.params[param_camel_case] = submit_ptp[i].parameters[param].value * 1000;
        } else {
          rule.rule.params[param_camel_case] = submit_ptp[i].parameters[param].value;
        }

        if (submit_ptp[i].parameters[param].unit) {
          rule.rule.params[param_camel_case] =
            rule.rule.params[param_camel_case] * times_seconds[submit_ptp[i].parameters[param].unit];
        }
      }
    }
    rule.punishment.type = submit_ptp[i].punishment;

    if (submit_ptp[i].to) {
      rule.to = submit_ptp[i].to;
    } else {
      delete rule.to;
    }
    if (submit_ptp[i].from) {
      rule.from = submit_ptp[i].from;
    } else {
      delete rule.from;
    }

    submit_policies.policies.push(rule);
  }

  return submit_policies;
}
