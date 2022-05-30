const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
//const csrf = require('csurf');
//const config = require('../../config');
//const debug = require('debug')('idm:hyperledger_route');
const hyperledger_controller = require('../../controllers/hyperledger/hyperledger');
const app = express();
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

//const csrf_protection = csrf({ cookie: true });

router.get('/invitation', hyperledger_controller.handler_create_invitation);
app.post('/webhooks/topic/connections', (req) => {
  if (req.body.rfc23_state === 'request-received') {
    const connection_id = req.body.connection_id;
    hyperledger_controller.handler_webhook(connection_id);
  }
});

const port = 10000;
app.listen(port, () => {
  console.log(`Webhook en el puerto ${port}`);
});

module.exports = router;
