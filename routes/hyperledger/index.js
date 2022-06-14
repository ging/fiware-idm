const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
//const csrf = require('csurf');
const config = require('../../config');
//const debug = require('debug')('idm:hyperledger_route');
const hyperledger_data = require('../../lib/hyperledger.js');
const hyperledger_controller = require('../../controllers/hyperledger/hyperledger');
const app = express();
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

let connection_id = '240b2132-a173-48aa-8e25-0d2f73d65ec8';
//const csrf_protection = csrf({ cookie: true });

router.get('/invitation', hyperledger_controller.handler_create_invitation);
router.get('/polling-invitation', hyperledger_controller.handler_polling_invitation);
router.get('/issue-credential', () => {
  hyperledger_controller.handler_issue_credential(
    connection_id,
    hyperledger_data.cred_def_id,
    hyperledger_data.issuer_did,
    hyperledger_data.schema_id,
    config.schema_name,
    config.schema_version
  );
});
app.post('/webhooks/topic/connections', (req) => {
  if (req.body.rfc23_state === 'request-received') {
    connection_id = req.body.connection_id;
    hyperledger_controller.handler_webhook(connection_id);
  }
});

const port = 10000;
app.listen(port, () => {
  console.log(`Webhook in port: ${port}`);
});

module.exports = router;
