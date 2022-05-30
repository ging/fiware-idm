//const Promise = require('bluebird');
//const config_service = require('./configService.js');
//const config = config_service.get_config().hyperledger;
//const debug = require('debug')('idm:hyperledger');
//const url = require("url");

const http = require('http');

let schema_data = '';
//const credential_data="";

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
        //credential_data=String(d);
        resolve();
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
    create_schema('schema22', '3.0').then(function (schema_data) {
      //debug(schema_data);

      if (schema_data.split(':')[0] === '400') {
        resolve('Schema already exists');
      } else {
        const data = JSON.parse(schema_data);
        //resolve(data)
        create_credential(data.sent.schema_id).then(function () {
          resolve('Schema and credential created');
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
        resolve();
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};
