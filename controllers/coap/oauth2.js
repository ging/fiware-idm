const debug = require('debug')('idm:coap_controller');
const OauthServer = require('oauth2-server'); //eslint-disable-line snakecase/snakecase
const Request = OauthServer.Request;
const Response = OauthServer.Response;

// Create Oauth Server model
const oauth_server = new OauthServer({
  model: require('../../models/model_oauth_server.js'),
  debug: true,
});

exports.paths = function(req, res) {
  const pet = req.method.toUpperCase() + ' ' + req.url;

  switch (pet) {
    case 'POST /oauth2/token':
      token(req, res);
      break;
    default:
      res.end('Not Found');
  }
};

// POST /oauth2/token -- Function to handle token requests
function token(req, res) {
  debug(' --> token');

  //const payload = JSON.parse(req.payload.toString('utf8'));
  req.query = {};

  debug(req);

  const request = new Request(req);
  const response = new Response(res);

  oauth_server
    .token(request, response)
    .then(function(token) {
      debug(token);
      res.status(200).json(response.body);
    })
    .catch(function(error) {
      debug('Error ', error);
      // Request is not authorized.
      return res.status(error.code || 500).json(error.message || error);
    });

  //res.end('Hello ' + req.url.split('/')[1] + '\n')
}
