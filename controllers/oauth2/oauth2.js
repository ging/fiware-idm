var models = require('../../models/models.js');
var userController = require('../../controllers/web/users');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

var debug = require('debug')('idm:oauth_controller');

// Create Oauth Server model
oauth = new oauthServer({
  model: require('../../models/model_oauth_server.js'),
  debug: true
});

// POST /oauth2/token -- Function to handle token requests
exports.token = function(req,res, next){

  debug(' --> token')
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

// MW to see if query contains response_type attribute
exports.response_type_required = function(req, res, next) {

  debug(' --> response_type_required')

  if (req.query.response_type && (req.query.response_type === 'code' || req.query.response_type === 'token')) {
    next();
  } else {
    var text = 'Invalid response_type'
    req.session.message = {text: text, type: 'warning'};
    res.redirect('/auth/login');
  }
}

// GET /oauth2/authorize -- Function to get form to sign in if user is not logged
exports.log_in = function(req, res, next) {

  debug(' --> log_in')

  models.oauth_client.findOne({
    where: {id: req.query.client_id},
    attributes: ['id', 'name', 'description', 'image', 'response_type', 'redirect_uri']
  }).then(function(application) {
    if (application) {
      res.render('oauth/index', {application: {
        name: application.name,
        description: application.description,
        response_type: req.query.response_type,
        id: req.query.client_id,
        state: req.query.state,
        redirect_uri: req.query.redirect_uri,
        image: ((application.image == 'default') ? '/img/logos/original/app.png' : ('/img/applications/'+application.image)) 
      }, errors: [] }); 
    } else {
      var text = 'Application with id = ' + req.query.client_id + ' doesn`t exist'
      req.session.message = {text: text, type: 'warning'};
      res.redirect('/auth/login');
    }
  }).catch(function(error) { next(error); }); 
}

// GET /oauth2/authorize -- Function to get authorize form if user is logged
exports.logged = function(req, res, next) {

  debug(' --> logged')

  render_oauth_authorize(req, res, next); 
}
// POST /oauth2/authorize -- Function to handle authentication of users
exports.authenticate_user = function(req, res, next){

    debug(' --> authenticate_user')

    // See if inputs are empty
    errors = []
    if (!req.body.email) {
        errors.push({message: 'email'});
    }
    if (!req.body.password) {
        errors.push({message: 'password'});
    }

    // If not, authenticate and search if user is authorized in the application
    if (req.body.email && req.body.password) {
      userController.authenticate(req.body.email, req.body.password, function(error, user) {
        if (error) {  // If error, send message to /auth/login
            req.session.errors = [{message: error.message}];
            res.redirect("/auth/login");        
            return;
        }

        // Create req.session.user and save id and username
        // The session is defined by the existence of: req.session.user
        var image = '/img/logos/small/user.png'
        if (user.gravatar) {
            image = gravatar.url(user.email, {s:25, r:'g', d: 'mm'}, {protocol: 'https'});
        } else if (user.image !== 'default') {
            image = '/img/users/' + user.image
        }    
        req.session.user = {id:user.id, username:user.username, email: user.email, image: image};

        render_oauth_authorize(req, res, next);
        
      });

    } else {
        req.session.errors = errors;
        res.redirect("/auth/login");  
    }
}

// POST /oauth2/authorize -- Function to handle authorization code requests
exports.authorize = function(req, res, next){

    debug(' --> authorize')

    models.role_assignment.findOne({
      where: { user_id: req.session.user.id, oauth_client_id: req.query.client_id},
      include: [{
        model: models.oauth_client,
        attributes: ['id', 'name', 'response_type', 'redirect_uri']
      }]
    }).then(function(application) {
      if (application) {
        req.body.email = req.session.user.email;
        var request = new Request(req);
        var response = new Response(res);

        return oauth.authorize(request, response).then(function(success) {
          if (req.query.response_type == "code") {
            redirect_uri = success.redirectUri + '?code=' + success.authorizationCode + '&state=' + req.query.state
            res.status(302).redirect(redirect_uri)                
          } else if (req.query.response_type == "token") {
            redirect_uri = success.client.redirectUris[0] + '#access_token=' + success.access_token + '&state='+req.query.state+'&token_type='+response.body.token_type+'&expires_in=' + response.body.expires_in
            res.status(302).redirect(redirect_uri)
          } else {
            throw new Error("Invalid response_type")
          }
        }).catch(function(err){
          res.status(err.code || 500).json(err)
        })

      } else {
        var text = 'User is not authorized in the application'
        req.session.message = {text: text, type: 'warning'};
        res.redirect('/');
      }
    }).catch(function(error) { next(error); });
}

// POST /oauth2/token -- Function to handle token authentication
exports.authenticate = function(options){

  debug(' --> authenticate')

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
      .then(function (user_info) {
        // Request is authorized.
        models.role_assignment.findAll({
          where: { user_id: user_info.user.id, oauth_client_id: user_info.OauthClient.id},
          include: [{
            model: models.role,
            attributes: ['id', 'name']
          }]
        }).then(function(role_assignment) {
          var response = {displayName: user_info.user.username, email: user_info.user.email, app_id: user_info.OauthClient.id}
          var roles = []
          if (role_assignment) {
            for (var i = 0; i < role_assignment.length; i++) {
              roles.push({id: role_assignment[i].Role.id, name: role_assignment[i].Role.name})
            }
            response['roles'] = roles
            res.send(response)  
          }
        }).catch(function(error) { next(error); });
        
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  }
}

// Function to show oauth/authorize view if user session exist
function render_oauth_authorize(req, res, next) {
  models.role_assignment.findOne({
    where: { user_id: req.session.user.id, oauth_client_id: req.query.client_id},
    include: [{
      model: models.oauth_client,
      attributes: ['id', 'name', 'response_type', 'redirect_uri']
    }]
  }).then(function(user_application) {
    if (user_application) {
      if (user_application.OauthClient.redirect_uri !== req.query.redirect_uri) {
        res.locals.message = {text: 'Mismatching redirect uri', type: 'warning'}  
      }
      res.render('oauth/authorize', {application: {
        name: user_application.OauthClient.name,
        response_type: req.query.response_type,
        id: req.query.client_id,
        redirect_uri: req.query.redirect_uri,
        state: req.query.state }
      });
    } else {
      var text = 'User is not authorized in the application or application does not exist'
      req.session.message = {text: text, type: 'warning'};
      res.redirect('/');
    }
  }).catch(function(error) { next(error); }); 
}