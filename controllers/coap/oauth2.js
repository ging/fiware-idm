const debug = require('debug')('idm:coap_controller');
const OauthServer = require('oauth2-server'); //eslint-disable-line snakecase/snakecase
const packet      = require('coap-packet')
    , parse       = packet.parse
    , generate    = packet.generate
const Request = OauthServer.Request;
const Response = OauthServer.Response;

// Create Oauth Server model
const oauth_server = new OauthServer({
  model: require('../../models/model_oauth_server.js'),
  jsonPayload: true, // eslint-disable-line snakecase/snakecase
  debug: true,
});

exports.paths = async function(req) {
  req = parse(req)
  let pet;

  req.body = JSON.parse(req.payload.toString('utf8'))
  delete req.payload
  req.query = {};
  req.headers = {};

  switch (req.code) {
    case '0.01':
      req.method = 'GET'
      break;
    case '0.02':
      req.method = 'POST'
      break;
    default:
      break;
  }

  for (var i = req.options.length - 1; i >= 0; i--) {
    req.options[i]['value'] = req.options[i]['value'].toString('utf8')

    if (req.options[i]['name'] == 'Uri-Path') {
      pet = req.method + ' ' + req.options[i]['value'];
    }
  }

  let response;
  switch (pet) {
    case 'POST /oauth2/token':
      response = await token(req);
      break;
    default:
      let coap_options =  {
        code: '4.00',
        token: req.token,
        ack: true,
        messageId: req.messageId
      }
      response = generate(coap_options)
      break;
  }
  return response
};

// POST /oauth2/token -- Function to handle token requests
function token(req, res) {
  debug(' --> token');

  //const payload = JSON.parse(req.payload.toString('utf8'));

  // Add variables to COAP request beacause are mandatory in OAuth dependency
  // req.query = {};
  // req.body = payload;
  // delete req.payload;

  const request = new Request(req);
  const response = new Response();
  
  return oauth_server
    .token(request, response)
    .then(function(result) {

      let payload = {
        "access_token": result.access_token,
      }
      
      let coap_options =  {
        code: '2.01',
        token: req.token,
        ack: true,
        messageId: req.messageId,
        payload: new Buffer(JSON.stringify(payload)),
        options: [{
            name: 'Content-Format',
            value: new Buffer('50')
        }]
      }
      return generate(coap_options)
    })
    .catch(function(error) {
      debug('Error ', error);

      let payload = 'error'
      
      let coap_options =  {
        code: '2.01',
        token: req.token,
        ack: true,
        messageId: req.messageId,
        payload: new Buffer(payload),
        options: [{
            name: 'Content-Format',
            value: new Buffer('0')
        }]
      }

      if (error.code) {
        let num = error.code;
        const digits = [];
        while (num > 0) {
          const numToPush = num % 10; // eslint-disable-line snakecase/snakecase
          digits.push(numToPush.toString());
          num = parseInt(num / 10); // eslint-disable-line snakecase/snakecase
        }
        digits.reverse().splice(1, 0, '.');
        coap_options.code = digits.join('');
      } else {
        coap_options.code = '5.00';
      }

      return generate(coap_options)
    });
}
