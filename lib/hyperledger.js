//const Promise = require('bluebird');
const config_service = require('./configService.js');
const config = config_service.get_config().hyperledger;
//const debug = require('debug')('idm:hyperledger');
//const url = require("url");

const http = require('http');
//const { identity } = require('lodash');
let cred_def_id = '';
//exports.cred_def_id = '';
exports.issuer_did = 'PLEVLDPJQMJvPLyX3LgB6S'; //Automatizar proceso? si usa mismo seed siempre devuelve el mismo did
let schema_id = '';
//exports.schema_id = '';

let schema_data = '';
let invitation_id = '';

function create_schema(schema_name, schema_version) {
  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      attributes: ['name', 'age'],
      schema_name,
      schema_version
    });

    const options = {
      hostname: 'localhost',
      port: 11000,
      path: '/schemas',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
        schema_data = String(d);
        resolve(schema_data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function create_credential(schema_id) {
  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      schema_id,
      tag: 'default'
    });

    const options = {
      hostname: 'localhost',
      port: 11000,
      path: '/credential-definitions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
        cred_def_id = JSON.parse(d).credential_definition_id;
        resolve(cred_def_id);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}
exports.create_invitation = function () {
  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      handshake_protocols: ['did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0'],
      use_public_did: false
    });

    const options = {
      hostname: 'localhost',
      port: 11000,
      path: '/out-of-band/create-invitation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
        const invitation_data = String(d);
        resolve(invitation_data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};
exports.init = function () {
  return new Promise(function (resolve) {
    create_schema(config.schema_name, config.schema_version).then(function (schema_data) {
      //debug(schema_data);

      if (schema_data.split(':')[0] === '400') {
        resolve('Schema already exists');
      } else {
        schema_id = JSON.parse(schema_data).sent.schema_id;
        //resolve(data)
        create_credential(schema_id).then(function (cred_def_id) {
          resolve('Schema and credential created', cred_def_id, schema_id);
        });
      }
    });
  }).catch(function (error) {
    console.log(error);
  });
};

exports.accepts_connection_request = function (connection_id) {
  return new Promise(function (resolve, reject) {
    const options = {
      hostname: 'localhost',
      port: 11000,
      path: '/didexchange/' + connection_id + '/accept-request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
        invitation_id = JSON.parse(d).invitation_msg_id;
        resolve(invitation_id);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};
exports.issuing_credential = function (connection_id, cred_def_id, issuer_did, schema_id, schema_name, schema_version) {
  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      auto_remove: true,
      comment: 'string',
      connection_id,
      credential_preview: {
        '@type': 'issue-credential/2.0/credential-preview',
        attributes: [
          {
            'mime-type': 'plain/text',
            name: 'name',
            value: 'Alice' //Parametrizar valores
          },
          {
            'mime-type': 'plain/text',
            name: 'age',
            value: '22'
          }
        ]
      },
      filter: {
        indy: {
          cred_def_id,
          issuer_did,
          schema_id,
          schema_issuer_did: issuer_did,
          schema_name,
          schema_version
        }
      },
      trace: true
    });

    const options = {
      hostname: 'localhost',
      port: 11000,
      path: '/issue-credential-2.0/send',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', (d) => {
        process.stdout.write(d);
        resolve();
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};
