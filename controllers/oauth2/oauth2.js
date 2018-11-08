var models = require('../../models/models.js');
var create_oauth_response = require('../../models/model_oauth_server.js').create_oauth_response;
var user_roles = require('../../models/model_oauth_server.js').user_roles;
var user_permissions = require('../../models/model_oauth_server.js').user_permissions;
var trusted_applications = require('../../models/model_oauth_server.js').trusted_applications;
var config_authzforce = require('../../config.js').authorization.authzforce
var config_eidas = require('../../config.js').eidas
var config_oauth2 = require('../../config.js').oauth2
var userController = require('../../controllers/web/users');
var oauthServer = require('oauth2-server');
var jsonwebtoken = require('jsonwebtoken');
var url = require('url');
var is_hex = require('is-hex');
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

	oauth.token(request,response).then(function(token) {
        if (token.client.token_type === 'jwt') {
            response.body.token_type = 'jwt'
            delete response.body.expires_in
        }
        res.json(response.body)
    }).catch(function(err){
        res.status(500).json(err)
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

// MW to search application
exports.load_application = function(req, res, next) {

    debug(' --> load_application')

    models.oauth_client.findOne({
        where: {id: req.query.client_id},
        attributes: ['id', 'name', 'description', 'image', 'response_type', 'redirect_uri']
    }).then(function(application) {
        if (application) {
            req.application = application
            next()
        } else {
            var text = 'Application with id = ' + req.query.client_id + ' doesn`t exist'
            req.session.message = {text: text, type: 'warning'};
            res.redirect('/');
        }
    }).catch(function(error) {
        next(error)
    })
}

// MW to check user session
exports.check_user = function(req, res, next) {

    debug(' --> check_user')

    if (req.session.user) {
        check_user_authorized_application(req, res)
    } else {
        var render_values = {
            application: {
                url: req.url,
                name: req.application.name,
                description: req.application.description,
                response_type: req.query.response_type,
                id: req.query.client_id,
                state: req.query.state,
                redirect_uri: req.query.redirect_uri,
                image: ((req.application.image == 'default') ? '/img/logos/original/app.png' : ('/img/applications/'+req.application.image)) 
            },
            errors: []
        }

        render_values["saml_request"] = {
            enabled: false
        }

        if (config_eidas.enabled && req.sp) {
            render_values.saml_request.xml = req.saml_auth_request.xml
            render_values.saml_request.postLocationUrl = req.saml_auth_request.postLocationUrl
            render_values.saml_request.redirectLocationUrl = req.saml_auth_request.redirectLocationUrl
            render_values.saml_request.enabled = true
        }

        res.render('oauth/index', render_values); 
    }
}

// POST /oauth2/authorize -- Function to handle authorization code and implicit requests
exports.authenticate_user = function(req, res, next){

    debug(' --> authenticate_user')

    if (req.session.user) {
        check_user_authorized_application(req, res)
    } else {
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

                check_user_authorized_application(req, res)

            });
        } else {
            req.session.errors = errors;
            res.redirect("/auth/login");
        }
    }
}

// Check if user has authorized the application
function check_user_authorized_application(req, res) {

    debug(' --> check_user_authorized_application')

    if (config_oauth2.ask_authorization) {
        search_user_authorized_application(req.session.user.id, req.application.id).then(function(user) {
            if (user) {
                req.user = user
                oauth_authorize(req, res)
            } else {
                if (req.application.redirect_uri !== req.query.redirect_uri) {
                    res.locals.message = {text: 'Mismatching redirect uri', type: 'warning'}  
                }

                res.render('oauth/authorize', {application: {
                    name: req.application.name,
                    response_type: req.query.response_type,
                    id: req.query.client_id,
                    redirect_uri: req.query.redirect_uri,
                    url: '/enable_app?'+url.parse(req.url).query,
                    state: req.query.state }
                });
            }
        }).catch(function(error) {
            debug("Error: ", error)
            req.session.errors = error
            res.redirect('/')
        })
    } else {
        req.user = req.session.user
        oauth_authorize(req, res)
    }
}

// Search user that has authorized the application
function search_user_authorized_application(user_id, app_id) {

    debug(' --> search_user_authorized_application')

    return models.user_authorized_application.findOne({
        where: {user_id: user_id, oauth_client_id: app_id},
        include: [{
            model: models.user,
            attributes: ['id', 'username', 'gravatar', 'image', 'email']
        }]
    }).then(function(user_is_authorized) {
        return user_is_authorized.User
    }).catch(function(error) {
       Promise.reject('Internal error')    
    })
}

// MW to load user
exports.load_user = function(req, res, next) {

    debug(' --> load_user')

    if (req.session.user.id) {

        models.user.findOne({
            where: { id: req.session.user.id}
        }).then(function(user) {
            req.user = user
            next()
        }).catch(function(error) {
            next(error)
        })
    } else {
        res.redirect('/')
    }
}

// POST /oauth2/enable_app -- User authorize the application to see their details
exports.enable_app = function(req, res, next){

    debug(' --> enable_app')

    oauth_authorize(req, res)
}

// Generate code or token
function oauth_authorize(req, res) {

    debug(' --> oauth_authorize')

    req.body.user = req.user
    if(req.body.user.dataValues === undefined) {
      req.body.user["dataValues"] = {}
    }
    req.body.user.dataValues["type"] = 'user'

    var request = new Request(req);
    var response = new Response(res);

    oauth.authorize(request, response).then(function(success) {
        res.redirect(success)
    }).catch(function(err){
        debug("Error: ", err)
        res.status(err.code || 500).json(err)
    })
}


// GET /user -- Function to handle token authentication
exports.authenticate_token = function(req, res, next) {

    debug(' --> authenticate_token')

    var action = (req.query.action) ? req.query.action : undefined
    var resource = (req.query.resource) ? req.query.resource : undefined
    var authzforce = (req.query.authzforce) ? req.query.authzforce : undefined
    var req_app = (req.query.app_id) ? req.query.app_id : undefined

    if ((action || resource) && authzforce) {
        var error = {message: 'Cannot handle 2 authentications levels at the same time', code: 400, title: 'Bad Request'}
        return res.status(400).json(error)
    }

    if (req_app) {
        models.oauth_client.findById(req_app).then(function(application) {
            if (application && application.token_type === 'jwt') {
                authenticate_jwt(req, res, action, resource, authzforce, req_app, application.jwt_secret)
            } else if (application && application.token_type === 'bearer') {
                authenticate_bearer(req, res, action, resource, authzforce, req_app)
            } else {
                var message = {
                    message: 'Unauthorized', 
                    code: 401, 
                    title: 'Unauthorized'
                }
                return res.status(401).json(message)
            }
        }).catch(function(err) {
            debug('Error ' + err)
            // Request is not authorized.
            return res.status(err.code || 500).json(err.message || err)
        })
    } else {
        authenticate_bearer(req, res, action, resource, authzforce, req_app)
    }
}

// POST /oauth2/revoke -- Function to revoke a token
exports.revoke_token = function(req, res, next) {

    debug(' --> revoke_token')

    var options = { }

    var request = new Request({
        headers: {authorization: req.headers.authorization},
        method: req.method,
        query: req.query,
        body: req.body
    });
    var response = new Response(res);

    return oauth.revoke(request, response, options).then(function (revoked) {
        debug(revoked)
    }).then(function(response){
        return res.status(200).json(response)
    }).catch(function (err) {
        debug('Error ' + err)
        // Request is not authorized.
        return res.status(err.code || 500).json(err.message || err)
    });
}

function authenticate_bearer(req, res, action, resource, authzforce, req_app) {

    debug(' --> authenticate_bearer')

    var options = {
        allowBearerTokensInQueryString: true
    }

    var request = new Request({
        headers: {authorization: req.headers.authorization},
        method: req.method,
        query: req.query,
        body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response, options).then(function (token_info) {
        var identity = token_info.user
        var application_id = token_info.oauth_client.id
        return create_oauth_response(identity, application_id, action, resource, authzforce, req_app)
    }).then(function(response){
        return res.status(201).json(response)
    }).catch(function (err) {
        debug('Error ' + err)
        // Request is not authorized.
        return res.status(err.code || 500).json(err.message || err)
    });
}


function authenticate_jwt(req, res, action, resource, authzforce, req_app, jwt_secret) {

    debug(' --> authenticate_jwt')

    jsonwebtoken.verify(req.query.access_token, jwt_secret, function(err, decoded) {
        if (err) {
            var message = {
                message: err,
                code: 401,
                title: 'Unauthorized'
            }
            return res.status(401).json(message)
        }

        var identity = {
            username: decoded.username,
            gravatar: decoded.isGravatarEnabled,
            email: decoded.email,
            id: decoded.id,
            type: (decoded.type) ? decoded.type : 'app'
        }

        var application_id = decoded.app_id

        create_oauth_response(identity, application_id, action, resource, authzforce, req_app).then(function(response) {
            return res.status(201).json(response)
        }).catch(function (err) {
            debug('Error ' + err)
            // Request is not authorized.
            return res.status(err.code || 500).json(err.message || err)
        });
    });
}
