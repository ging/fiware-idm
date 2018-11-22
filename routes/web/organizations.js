var express = require('express');
var router = express.Router();
var multer  = require('multer');
var path = require('path');
var uuid = require('uuid');
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true });
var fs = require('fs');

// Home web Controller
var web_org_controller = require('../../controllers/web/index').organizations;
var web_auth_org_controller = require('../../controllers/web/index').authorize_org_apps;
var web_man_memb_controller = require('../../controllers/web/index').manage_members;

// Autoloads
router.param('organizationId',  web_org_controller.load_organization);

// Route to save images of applications
var imageOrgUpload = multer.diskStorage({			
    destination: function(req, file, callback) {
    	if (!fs.existsSync('./public/img/organizations/')){
		  fs.mkdirSync('./public/img/organizations/');
		}
        callback(null, './public/img/organizations/')
    },
    filename: function(req, file, callback) {
        callback(null, uuid.v4() + path.extname(file.originalname))
    }
})

// Routes for organziations
router.get('/available',                               csrfProtection, web_auth_org_controller.available_organizations);

router.get('/',                                        csrfProtection, web_org_controller.index);
router.get('/filtered',                   			   csrfProtection, web_org_controller.filter);
router.get('/new',                                     csrfProtection, web_org_controller.new);
router.post('/',                                       csrfProtection, web_org_controller.create);
router.get('/:organizationId',                         csrfProtection, web_org_controller.show);
router.get('/:organizationId/members',                 csrfProtection, web_org_controller.get_members);
router.get('/:organizationId/applications',            csrfProtection, web_org_controller.get_applications);
router.get('/:organizationId/edit',                    web_org_controller.owned_permissions,  csrfProtection, web_org_controller.edit);
router.put('/:organizationId/edit/avatar',             web_org_controller.owned_permissions,  multer({storage: imageOrgUpload}).single('image'), csrfProtection,  web_org_controller.update_avatar);
router.put('/:organizationId/edit/info',               web_org_controller.owned_permissions,  csrfProtection,    web_org_controller.update_info);
router.delete('/:organizationId/edit/delete_avatar',   web_org_controller.owned_permissions,  csrfProtection,    web_org_controller.delete_avatar);
router.delete('/:organizationId',                      web_org_controller.owned_permissions,  csrfProtection,    web_org_controller.destroy);
router.delete('/:organizationId/remove',               csrfProtection,    web_org_controller.remove);

// Routes to manage members in organizations
router.get('/:organizationId/edit/members',            web_org_controller.owned_permissions,  csrfProtection,    web_man_memb_controller.get_members);
router.post('/:organizationId/edit/members',           web_org_controller.owned_permissions,  csrfProtection,    web_man_memb_controller.add_members);

module.exports = router;