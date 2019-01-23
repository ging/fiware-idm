const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('cookie-session');
const partials = require('express-partials');
const sassMiddleware = require('node-sass-middleware');
const forceSsl = require('express-force-ssl');
const clc = require('cli-color');
const i18n = require('i18n-express');
const debug = require('debug')('idm:app');

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
app.use(logger('dev'));

// Disabled header
app.disable('x-powered-by');

// Parse request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

const up_date = new Date();

// Set routes for version
app.use('/version', function(req, res) {
  const version = require('./version.json');
  version.keyrock.uptime = require('./lib/time').ms_to_time(
    new Date() - up_date
  );
  version.keyrock.api.link = config.host + '/' + version.keyrock.api.version;
  res.send(version);
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(partials());

app.use(cookieParser(config.session.secret));
app.use(
  session({
    secret: config.session.secret,
    name: 'session',
    secure: config.https.enabled,
    maxAge: config.session.expires,
  })
);

const styles = config.site.theme || 'default';
// Middleware to convert sass files to css
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'themes/' + styles),
    dest: path.join(__dirname, 'public/stylesheets'),
    debug: true,
    //outputStyle: 'compressed',
    outputStyle: 'extended',
    prefix: '/stylesheets', // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(
  i18n({
    translationsPath: path.join(__dirname, 'etc/translations'), // <--- use here. Specify translations files path.
    siteLangs: ['en', 'es'],
    textsVarName: 'translation',
    browserEnable: true,
    defaultLang: 'en',
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

  res.locals.site = config.site;
  res.locals.fs = require('fs');

  next();
});

// Force HTTPS connection to web server
if (config.https.enabled) {
  app.set('forceSSLOptions', {
    enable301Redirects: true,
    trustXFPHeader: false,
    httpsPort: config.https.port,
    sslRequiredMessage: 'SSL Required.',
  });

  // Set routes for api
  app.use('/v1', forceSsl, api);
  app.use('/v3', forceSsl, api); // REDIRECT OLD KEYSTONE REQUESTS TO THE SAME API

  // Set routes for oauth2
  app.use('/oauth2', forceSsl, oauth2);
  app.get(
    '/user',
    forceSsl,
    require('./controllers/oauth2/oauth2').authenticate_token
  );

  // Set routes for saml2
  app.use('/saml2', forceSsl, saml2);

  // Set routes for GUI
  app.use('/', forceSsl, index);
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
