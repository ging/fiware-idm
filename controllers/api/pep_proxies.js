var debug = require('debug')('idm:api-pep_proxies');
var models = require('../../models/models.js');
var uuid = require('uuid');

// MW to check pep proxy authentication
exports.authenticate = function(id, password, callback) {

    debug("--> authenticate")
    
    // Search the user through the email
    models.pep_proxy.find({
        where: {
            id: id
        }
    }).then(function(pep_proxy) {
        if (pep_proxy) {
            // Verify password 
            if(pep_proxy.verifyPassword(password)){
                callback(null, pep_proxy);
            } else { callback(new Error('invalid')); }   
        } else { callback(new Error('pep_proxy_not_found')); }
    }).catch(function(error){ callback(error) });
};

// GET /v1/pep_proxies -- Send index of pep_proxies
exports.index = function(req, res) {
	debug('--> index')
	res.send("ok")
}

// POST v1/pep_proxies -- Create pep_proxie
exports.create = function(req, res) {
	debug('--> create')
	res.send("ok")
}

// GET v1/pep_proxies/:pep_proxyId -- Get info about pep_proxy
exports.info = function(req, res) {
	debug('--> info')
	res.send("ok")
}

// PATCH v1/pep_proxies/:pep_proxyId -- Edit pep_proxy
exports.update = function(req, res) {
	debug('--> update')
	res.send("ok")
}

// DELETE v1/pep_proxies/:pep_proxyeId -- Delete pep_proxy
exports.delete = function(req, res) {
	debug('--> delete')
	res.send("ok")
}