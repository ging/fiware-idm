const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const csrf = require('csurf');
const csrf_protection = csrf({ cookie: true });
const fs = require('fs');

// Home web Controller
const web_org_controller = require('../../controllers/web/index').organizations;
const web_auth_org_controller = require('../../controllers/web/index').authorize_org_apps;
const web_man_memb_controller = require('../../controllers/web/index').manage_members;

// Autoloads
router.param('organization_id', web_org_controller.load_organization);

// Route to save images of applications
const image_org_upload = multer.diskStorage({
  destination(req, file, callback) {
    if (!fs.existsSync('./public/img/organizations/')) {
      fs.mkdirSync('./public/img/organizations/');
    }
    callback(null, './public/img/organizations/');
  },
  filename(req, file, callback) {
    callback(null, uuid.v4() + path.extname(file.originalname));
  }
});

// Routes for organziations
router.get('/available', csrf_protection, web_auth_org_controller.available_organizations);

router.get('/', csrf_protection, web_org_controller.index);
router.get('/filtered', csrf_protection, web_org_controller.filter);
router.get('/new', csrf_protection, web_org_controller.new);
router.post('/', csrf_protection, web_org_controller.create);
router.get('/:organization_id', csrf_protection, web_org_controller.show);
router.get('/:organization_id/members', csrf_protection, web_org_controller.get_members);
router.get('/:organization_id/applications', csrf_protection, web_org_controller.get_applications);
router.get('/:organization_id/edit', web_org_controller.owned_permissions, csrf_protection, web_org_controller.edit);
router.put(
  '/:organization_id/edit/avatar',
  web_org_controller.owned_permissions,
  multer({ storage: image_org_upload }).single('image'),
  csrf_protection,
  web_org_controller.update_avatar
);
router.put(
  '/:organization_id/edit/info',
  web_org_controller.owned_permissions,
  csrf_protection,
  web_org_controller.update_info
);
router.delete(
  '/:organization_id/edit/delete_avatar',
  web_org_controller.owned_permissions,
  csrf_protection,
  web_org_controller.delete_avatar
);
router.delete('/:organization_id', web_org_controller.owned_permissions, csrf_protection, web_org_controller.destroy);
router.delete('/:organization_id/remove', csrf_protection, web_org_controller.remove);

// Routes to manage members in organizations
router.get(
  '/:organization_id/edit/members',
  web_org_controller.owned_permissions,
  csrf_protection,
  web_man_memb_controller.get_members
);
router.post(
  '/:organization_id/edit/members',
  web_org_controller.owned_permissions,
  csrf_protection,
  web_man_memb_controller.add_members
);

module.exports = router;
