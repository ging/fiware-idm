var models = require('../models/models.js');
var userController = require('./user_controller');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

// Create Oauth Server model
oauth = new oauthServer({
  model: require('../models/model_oauth_server.js'),
  debug: true
});

// Function to handle token requests
exports.token = function(req,res, next){
	var request = new Request(req);
	var response = new Response(res);

	oauth
	  .token(request,response)
	  .then(function(token) {
	    // Todo: remove unnecessary values in response
	    return res.json(response.body)
	  }).catch(function(err){
	    return res.status(500).json(err)
	  })
}

// Function to get form to sign in
exports.log_in = function(req, res) {
  if (!req.session.user) {
  	models.oauth_client.findById(req.query.client_id).then(function(client) {
  		if (client) {
  			res.render('oauth/index', {client: client, errors: [] });
  		} else {
  			res.redirect('/auth/login');
  			// PONER ERROR EN LA VISTA DE AUTH/LOGIN 
  			next(new Error("No existe la aplicacion con id = " + applicationId));
  		}
  	}).catch(function(error) { next(error); });
  } else {
    models.oauth_client.findById(req.query.client_id).then(function(client) {
      if (client) {
        res.render('oauth/authorize', {client: client});
      } else {
        res.redirect('/auth/login');
        next(new Error("No existe la aplicacion con id = " + applicationId));
      }
    }).catch(function(error) { next(error); });
  }
}

// Function to handle authorization code requests
exports.authorize = function(req, res){

    if (req.session.user) {
      req.body.email = req.session.user.email;
      var request = new Request(req);
      var response = new Response(res);

      return oauth.authorize(request, response).then(function(success) {
        // console.log(response.body)
        // console.log(success)
        if (req.query.response_type == "code") {
          // Solo hay una redirect uri almacenada en el array de redirectUris
          // Cambiar state y token_type para que te lo devuelva la libreria de oauth (esta puesto por defecto en la uri)
          redirect_uri = success.redirectUri + '?code=' + success.authorizationCode
          res.status(302).redirect(redirect_uri)                
        } else if (req.query.response_type == "token") {
          redirect_uri = success.client.redirectUris[0] + '#access_token=' + success.access_token + '&state=xyz&token_type=Bearer&expires_in=' + response.body.expires_in
          res.status(302).redirect(redirect_uri)
        } else {
          throw new Error("Invalid response_type")
        }
      }).catch(function(err){
        res.status(err.code || 500).json(err)
      })
    } else {
      errors = []
      if (!req.body.email) {
          errors.push({message: 'email'});
      }
      if (!req.body.password) {
          errors.push({message: 'password'});
      }

      if (req.body.email && req.body.password) {
          userController.authenticate(req.body.email, req.body.password, function(error, user) {
              if (error) {  // si hay error retornamos mensajes de error de sesión
                  req.session.errors = [{message: error.message}];
                  res.redirect("/auth/login");        
                  return;
              }

              req.session.user = {id:user.id, email:user.email};
              models.oauth_client.findById(req.query.client_id).then(function(client) {
                if (client) {
                  res.render('oauth/authorize', {client: client});
                } else {
                  res.redirect('/auth/login');
                  next(new Error("No existe la aplicacion con id = " + applicationId));
                }
              }).catch(function(error) { next(error); });

          });
      } else {
          req.session.errors = errors;
          res.redirect("/auth/login");  
      }
    }
}

// Function to handle token authentication
exports.authenticate = function(options){
  var options = options || {};
  return function(req, res, next) {
    var request = new Request({
      headers: {authorization: req.headers.authorization},
      method: req.method,
      query: req.query,
      body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response,options)
      .then(function (token) {
        // Request is authorized.
        req.user = token
        next()
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  }
}