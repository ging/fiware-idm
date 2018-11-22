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
var web_user_controller = require('../../controllers/web/index').users;
var web_auth_user_controller = require('../../controllers/web/index').authorize_user_apps;

// Autoloads
router.param('userId',  web_user_controller.load_user);

// Route to save images of users
var imageUserUpload = multer.diskStorage({
    destination: function(req, file, callback) {
    	if (!fs.existsSync('./public/img/users/')){
		  fs.mkdirSync('./public/img/users/');
		}
        callback(null, './public/img/users/')
    },
    filename: function(req, file, callback) {
        callback(null, uuid.v4() + path.extname(file.originalname))
    }
})

// Routes for users
router.get('/available',                       csrfProtection,  web_auth_user_controller.available_users);

router.get('/:userId',                         csrfProtection, web_user_controller.show);
router.get('/:userId/organizations',           csrfProtection, web_user_controller.get_organizations);
router.get('/:userId/applications',            csrfProtection, web_user_controller.get_applications);
router.get('/:userId/edit',                    web_user_controller.owned_permissions,   csrfProtection,     web_user_controller.edit);
router.put('/:userId/edit/info',               web_user_controller.owned_permissions,   csrfProtection,     web_user_controller.update_info);
router.post('/:userId/edit/avatar',            web_user_controller.owned_permissions,   multer({storage: imageUserUpload}).single('image'),  csrfProtection,    web_user_controller.update_avatar);
router.put('/:userId/edit/avatar',             web_user_controller.owned_permissions,   csrfProtection,     web_user_controller.set_avatar);
router.delete('/:userId/edit/avatar/delete',   web_user_controller.owned_permissions,   csrfProtection,     web_user_controller.delete_avatar);
router.put('/:userId/edit/gravatar',           web_user_controller.owned_permissions,   csrfProtection,     web_user_controller.set_gravatar);
router.put('/:userId/tour_ended',			   web_user_controller.owned_permissions,   csrfProtection,     web_user_controller.starter_tour_ended)

module.exports = router;