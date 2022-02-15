const fs = require('fs');
const exec = require('child_process').exec;

const config_service = require('./configService.js');
const config = config_service.get_config();

const debug = require('debug')('idm:web-application_controller');

// Function to generate Application certificates
exports.generate_app_certificates = function (application) {
  debug('--> generate_app_certificates');

  if (!fs.existsSync('./certs/applications')) {
    fs.mkdirSync('./certs/applications');
  }

  if (fs.existsSync('./certs/applications/' + application.id + '-oidc-key.pem')) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const key_name = 'certs/applications/' + application.id + '-oidc-key.pem';
    const csr_name = 'certs/applications/' + application.id + '-oidc-csr.pem';
    const cert_name = 'certs/applications/' + application.id + '-oidc-cert.pem';

    const key = 'openssl genrsa -out ' + key_name + ' 2048';
    const csr =
      'openssl req -new -sha256 -key ' +
      key_name +
      ' -out ' +
      csr_name +
      ' -subj "/C=IK/ST=World/L=World/' +
      'O=' +
      application.name +
      '/OU=' +
      application.name +
      '/CN=' +
      config.host.split(':')[0] +
      '"';

    const cert = 'openssl x509 -days 365 -req -in ' + csr_name + ' -signkey ' + key_name + ' -out ' + cert_name;

    const create_certificates = key + ' && ' + csr + ' && ' + cert;
    exec(create_certificates, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Delete certificates
exports.delete_app_certificates = function (application) {
  debug('--> delete_app_certificates');

  try {
    if (fs.existsSync('./certs/applications')) {
      if (fs.existsSync('./certs/applications/' + application.id + '-oidc-key.pem')) {
        fs.unlinkSync('./certs/applications/' + application.id + '-oidc-key.pem');
        fs.unlinkSync('./certs/applications/' + application.id + '-oidc-cert.pem');
        fs.unlinkSync('./certs/applications/' + application.id + '-oidc-csr.pem');
      }
      if (fs.existsSync('./certs/applications/' + application.id + '-key.pem')) {
        fs.unlinkSync('./certs/applications/' + application.id + '-key.pem');
        fs.unlinkSync('./certs/applications/' + application.id + '-cert.pem');
        fs.unlinkSync('./certs/applications/' + application.id + '-csr.pem');
      }
    }
  } catch (err) {
    console.error(err);
  }
}
