const body_parser = require('body-parser');
const useragent = require('express-useragent');
const clc = require('cli-color');
const cookie_parser = require('cookie-parser');
const cors = require('cors');
const debug = require('debug')('idm:app');
const express = require('express');
const favicon = require('serve-favicon');
const force_ssl = require('express-force-ssl');
const i18n = require('i18n-express');
const logger = require('morgan');
const method_override = require('method-override');
const partials = require('express-partials');
const path = require('path');
const sass_middleware = require('node-sass-middleware');
const session = require('cookie-session');

// Obtain secret from config file
const config = require('./config.js');

// Create vars that store routes
const index = require('./routes/web/index');
const api = require('./routes/api/index');
const oauth2 = require('./routes/oauth2/oauth2');
const saml2 = require('./routes/saml2/saml2');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set logs in development
if (config.debug) {
  app.use(logger('dev'));
}

// Disabled header
app.disable('x-powered-by');

// Parse request
app.use(body_parser.json({ limit: '50mb' }));
app.use(body_parser.urlencoded({ limit: '50mb', extended: true }));

// Parse user agent header
app.use(useragent.express());

// CORS Enable
if (config.cors.enabled) {
  app.use(cors(config.cors.options));
}

// Set routes for version
const up_date = new Date();
app.use('/version', function(req, res) {
  const version = require('./version.json');
  version.keyrock.uptime = require('./lib/time').ms_to_time(
    new Date() - up_date
  );
  version.keyrock.api.link = config.host + '/' + version.keyrock.api.version;
  res.status(200).send(version);
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(partials());

app.use(cookie_parser(config.session.secret));
app.use(
  session({
    secret: config.session.secret,
    name: 'session',
    secure: config.https.enabled,
    maxAge: config.session.expires, // eslint-disable-line snakecase/snakecase
  })
);

const styles = config.site.theme || 'default';
// Middleware to convert sass files to css
app.use(
  sass_middleware({
    src: path.join(__dirname, 'themes/' + styles),
    dest: path.join(__dirname, 'public/stylesheets'),
    debug: config.debug,
    outputStyle: 'extended', // eslint-disable-line snakecase/snakecase
    prefix: '/stylesheets', // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(method_override('_method'));

app.use(
  i18n({
    translationsPath: path.join(__dirname, 'etc/translations'), // eslint-disable-line snakecase/snakecase
    siteLangs: ['en', 'es', 'ja', 'ko'], // eslint-disable-line snakecase/snakecase
    textsVarName: 'translation', // eslint-disable-line snakecase/snakecase
    browserEnable: true, // eslint-disable-line snakecase/snakecase
    defaultLang: 'en', // eslint-disable-line snakecase/snakecase
  })
);

// Helpers dinamicos:
app.use(function(req, res, next) {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  );

  // init req.session.redir
  if (!req.session.redir) {
    req.session.redir = '/';
  }

  // To make visible req.session in the view
  res.locals.session = req.session;

  // {text: 'message text', type: 'info | success | warning | danger'}
  res.locals.message = {};
  // {text: 'message text', status: ''}
  res.locals.error = {};

  res.locals.site = config.site;
  res.locals.fs = require('fs');

  next();
});

// Force HTTPS connection to web server
if (config.https.enabled) {
  app.set('forceSSLOptions', {
    enable301Redirects: true, // eslint-disable-line snakecase/snakecase
    trustXFPHeader: false, // eslint-disable-line snakecase/snakecase
    httpsPort: config.https.port, // eslint-disable-line snakecase/snakecase
    sslRequiredMessage: 'SSL Required.', // eslint-disable-line snakecase/snakecase
  });

  // Set routes for api
  app.use('/v1', force_ssl, api);
  app.use('/v3', force_ssl, api); // REDIRECT OLD KEYSTONE REQUESTS TO THE SAME API

  // Set routes for oauth2
  app.use('/oauth2', force_ssl, oauth2);
  app.get(
    '/user',
    force_ssl,
    require('./controllers/oauth2/oauth2').authenticate_token
  );

  // Set routes for saml2
  app.use('/saml2', force_ssl, saml2);

  // Set routes for GUI
  app.use('/', force_ssl, index);
} else {
  // Set routes for api
  app.use('/v1', api);
  app.use('/v3', api); // REDIRECT OLD KEYSTONE REQUESTS TO THE SAME API

  // Set routes for oauth2
  app.use('/oauth2', oauth2);
  app.get('/user', require('./controllers/oauth2/oauth2').authenticate_token);

  // Set routes for saml2
  app.use('/saml2', saml2);

  // Set routes for GUI
  app.use('/', index);
}

// Check connection with Authzforce
if (config.authorization.authzforce.enabled) {
  require('./lib/authzforce.js')
    .check_connection()
    .then(function(status) {
      debug(clc.green('Connection with Authzforce: ' + status));
    })
    .catch(function(error) {
      debug(clc.red(error));
    });
}

module.exports = app;
