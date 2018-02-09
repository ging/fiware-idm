var models = require('../../models/models.js');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

// Create Oauth Server model
oauth = new oauthServer({
  model: require('../../models/model_oauth_server.js'),
  debug: true
});

var debug = require('debug')('idm:api-authenticate');

// Middleware to check users token
var check_token = function(req, res, next) {

	debug(' --> check_token')

  	var options = options || {};

	var request = new Request({
  		headers: {authorization: req.headers.authorization},
	      method: req.method,
	      query: req.query,
	      body: req.body
	});
	var response = new Response(res);

	oauth.authenticate(request, response,options).then(function (user_info) {
		req.user_info = user_info
		next()

	}).catch(function (err) {
		debug(" Error: " + err)
		// Request is not authorized.
		res.status(err.code || 500).json(err)
	});
}

module.exports = {
	check_token: check_token
}