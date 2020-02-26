const debug = require('debug')('idm:coap_controller');
const OauthServer = require('oauth2-server'); //eslint-disable-line snakecase/snakecase
const Request = OauthServer.Request;
const Response = OauthServer.Response;

// Create Oauth Server model
const oauth_server = new OauthServer({
  model: require('../../models/model_oauth_server.js'),
  jsonPayload: true, // eslint-disable-line snakecase/snakecase
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

  const payload = JSON.parse(req.payload.toString('utf8'));

  // Add variables to COAP request beacause are mandatory in OAuth dependency
  req.query = {};
  req.body = payload;
  delete req.payload;

  const request = new Request(req);
  const response = new Response(res);

  oauth_server
    .token(request, response)
    .then(function(result) {
      const response = {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
      res.code = '2.01';
      res.end(JSON.stringify(response));
    })
    .catch(function(error) {
      debug('Error ', error);

      if (error.code) {
        let num = error.code;
        const digits = [];
        while (num > 0) {
          const numToPush = num % 10; // eslint-disable-line snakecase/snakecase
          digits.push(numToPush.toString());
          num = parseInt(num / 10); // eslint-disable-line snakecase/snakecase
        }
        digits.reverse().splice(1, 0, '.');
        res.code = digits.join('');
      } else {
        res.code = '5.00';
      }

      res.end('error');
    });
}
