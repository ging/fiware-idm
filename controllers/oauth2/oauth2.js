var models = require('../../models/models.js');
var config_authzforce = require('../../config.js').authorization.authzforce
var config_eidas = require('../../config.js').eidas
var userController = require('../../controllers/web/users');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
                state: req.query.state }
            });
        }
    }).catch(function(error) {
        req.session.errors = error
        res.redirect('/')
    })
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

    var request = new Request(req);
    var response = new Response(res);

    oauth.authorize(request, response).then(function(success) {
        res.redirect(success)
    }).catch(function(err){
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

        var user = token_info.user
        var application_id = token_info.oauth_client.id

        if (user._modelOptions.tableName === 'user') {

            var user_info = require('../../oauth_response/oauth_user_response.json');

            user_info.username = user.username
            user_info.app_id = application_id
            user_info.isGravatarEnabled = user.gravatar
            user_info.email = user.email
            user_info.id = user.id

            return search_user_info(user_info, action, resource, req_app, authzforce)
        } else if (user._modelOptions.tableName === 'iot') {

            var iot_info = require('../../oauth_response/oauth_iot_response.json');

            iot_info.app_id = application_id
            iot_info.id = user.id

            return iot_info
        }
    }).then(function(response){
        return res.status(201).json(response) 
    }).catch(function (err) {
        debug('Error ' + err)
        // Request is not authorized.
        return res.status(err.code || 500).json(err.message || err)
    });
}


// Check if user has enabled the application to read their details
function search_user_info(user_info, action, resource, req_app, authzforce) {

    debug(' --> search_user_info')

    return new Promise(function(resolve, reject) {

        var promise_array = []

        var search_roles = user_roles(user_info.id, user_info.app_id)

        promise_array.push(search_roles)

        var search_trusted_apps = trusted_applications(req_app)

        promise_array.push(search_trusted_apps)

        if (action && resource) {

            var search_permissions = search_roles.then(function(roles) {
                return user_permissions(roles.all, user_info.app_id, action, resource)
            })
            promise_array.push(search_permissions)
        }

        // Search authzforce if level 3 enabled
        if (config_authzforce.enabled && authzforce) {
            var search_authzforce = app_authzforce_domain(user_info.app_id)
            promise_array.push(search_authzforce)
        }

        Promise.all(promise_array).then(function(values) {

            var roles = values[0]

            user_info.roles = roles.user
            user_info.organizations = roles.organizations

            user_info.trusted_apps = values[1]

            if (req_app !== user_info.app_id) {
                if (user_info.trusted_apps.includes(user_info.app_id) === false) {
                    reject({message: 'User not authorized in application', code: 401, title: 'Unauthorized'})    
                }
            }

            if (action && resource) {
                if (values[2] && values[2].length > 0) {
                    user_info.authorization_decision = "Permit"
                } else {
                    user_info.authorization_decision = "Deny"
                }
            }


            if (config_authzforce.enabled && authzforce) {
                var authzforce_domain = values[2]
                if (authzforce_domain) {
                    user_info.app_azf_domain = authzforce_domain.az_domain
                }
            }

            resolve(user_info)

        }).catch(function(error) {
            reject({message: 'Internal error', code: 500, title: 'Internal error'})
        })
    })
}

// Search user roles in application
function user_roles(user_id, app_id) {

    debug(' --> user_roles')

    var promise_array = []

    // Search organizations in wich user is member or owner
    promise_array.push(
        models.user_organization.findAll({ 
            where: { user_id: user_id },
            include: [{
                model: models.organization,
                attributes: ['id']
            }]
        })
    )

    // Search roles for user or the organization to which the user belongs
    promise_array.push(
        promise_array[0].then(function(organizations) { 
            var search_role_organizations = []
            if (organizations.length > 0) {

                for (var i = 0; i < organizations.length; i++) {
                    search_role_organizations.push({organization_id: organizations[i].organization_id, role_organization: organizations[i].role})
                }
            }
            return models.role_assignment.findAll({
                where: { [Op.or]: [{ [Op.or]: search_role_organizations}, {user_id: user_id}], 
                         oauth_client_id: app_id,
                         role_id: { [Op.notIn]: ['provider', 'purchaser']} },
                include: [{
                    model: models.user,
                    attributes: ['id', 'username', 'email', 'gravatar']
                },{
                    model: models.role,
                    attributes: ['id', 'name']
                }, {
                    model: models.organization,
                    attributes: ['id', 'name', 'description', 'website']
                }]
            })
        })
    )

    return Promise.all(promise_array).then(function(values) {
        var role_assignment = values[1]

        var user_app_info = { user: [], organizations: [], all: [] }

        for (i=0; i < role_assignment.length; i++) {

            var role = role_assignment[i].Role.dataValues

            user_app_info.all.push(role.id)

            if (role_assignment[i].Organization) {
                
                var organization = role_assignment[i].Organization.dataValues
                var index = user_app_info.organizations.map(function(e) { return e.id; }).indexOf(organization.id);

                if (index < 0) {
                    organization['roles'] = [role]
                    user_app_info.organizations.push(organization)
                } else {
                    user_app_info.organizations[index].roles.push(role)
                }
            }

            if (role_assignment[i].User) {
                user_app_info.user.push(role)
            }
        }
        return Promise.resolve(user_app_info)
    }).catch(function(error) {
        return Promise.reject({message: 'Internal error', code: 500, title: 'Internal error'})
    })
}

// Search user permissions in application whose action and resource are recieved from Pep Proxy
function user_permissions(roles_id, app_id, action, resource) {

    debug(' --> user_permissions')

    return models.role_permission.findAll({
        where: { role_id: roles_id },
        attributes: ['permission_id']
    }).then(function(permissions) {
        if (permissions.length > 0) {
            return models.permission.findAll({
                where: { id: permissions.map(elem => elem.permission_id),
                         oauth_client_id: app_id,
                         action: action,
                         resource: resource }
            })
        } else {
            return []
        }
    })
}

// Search Trusted applications
function trusted_applications(app_id) {

    debug(' --> trusted_applications')

    return models.trusted_application.findAll({
        where: { oauth_client_id: app_id },
        attributes: ['trusted_oauth_client_id']
    }).then(function(trusted_apps) {
        if (trusted_apps.length > 0) {
            return trusted_apps.map(id => id.trusted_oauth_client_id)
        } else {
            return []
        }
    })
}

// Search authzforce domain for specific application
function app_authzforce_domain(app_id) {

    debug(' --> app_authzforce_domain')

    return models.authzforce.findOne({
        where: { oauth_client_id: app_id },
        attributes: ['az_domain']
    })
}