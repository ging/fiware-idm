const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });
const fs = require('fs');

// Home web Controller
const web_user_controller = require('../../controllers/web/index').users;
const web_auth_user_controller = require('../../controllers/web/index').authorize_user_apps;

// Autoloads
router.param('user_id', web_user_controller.load_user);

// Route to save images of users
const image_user_upload = multer.diskStorage({
  destination(req, file, callback) {
    if (!fs.existsSync('./public/img/users/')) {
      fs.mkdirSync('./public/img/users/');
    }
    callback(null, './public/img/users/');
  },
  filename(req, file, callback) {
    callback(null, uuid.v4() + path.extname(file.originalname));
  }
});

// Routes for users
router.get('/available', csrf_protection, web_auth_user_controller.available_users);

router.get('/:user_id', csrf_protection, web_user_controller.show);
router.get('/:user_id/organizations', csrf_protection, web_user_controller.get_organizations);
router.get('/:user_id/applications', csrf_protection, web_user_controller.get_applications);
router.get('/:user_id/edit', web_user_controller.owned_permissions, csrf_protection, web_user_controller.edit);
router.put(
  '/:user_id/edit/info',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.update_info
);
router.post(
  '/:user_id/edit/avatar',
  web_user_controller.owned_permissions,
  multer({ storage: image_user_upload }).single('image'),
  csrf_protection,
  web_user_controller.update_avatar
);
router.put(
  '/:user_id/edit/avatar',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.set_avatar
);
router.delete(
  '/:user_id/edit/avatar/delete',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.delete_avatar
);
router.put(
  '/:user_id/edit/gravatar',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.set_gravatar
);
router.put(
  '/:user_id/tour_ended',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.starter_tour_ended
);
//------------------------
router.get(
  '/:user_id/_third_party_applications',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.show_third_party_applications
);
router.delete(
  '/:user_id/_third_party_applications',
  web_user_controller.owned_permissions,
  csrf_protection,
  web_user_controller.delete_third_party_application,
  web_user_controller.show_third_party_applications
);

//---------------------------
module.exports = router;
