# Identity Manager - Keyrock

[![FIWARE Security](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/security.svg)](https://www.fiware.org/developers/catalogue/)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/search?q=%5Bfiware%5D+keyrock)

Keyrock is the FIWARE component responsible for Identity Management. Using
Keyrock (in conjunction with other security components such as
[PEP Proxy](https://github.com/ging/fiware-pep-proxy) and
[Authzforce](https://github.com/authzforce/server)) enables you to add
OAuth2-based authentication and authorization security to your services and
applications.

This project is part of [FIWARE](https://www.fiware.org/). For more information
check the FIWARE Catalogue entry for
[Security](https://github.com/Fiware/catalogue/tree/master/security).

## Background

The main identity management concepts within Keyrock are:

-   Users
    -   Have a registered account in Keyrock.
    -   Can manage organizations and register applications.
-   Organizations
    -   Are group of users that share resources of an application (roles and
        permissions).
    -   Users can be members or owners (manage the organization).
-   Applications
    -   has the client role in the OAuth 2.0 architecture and will request
        protected user data.
    -   Are able to authenticate users using their Oauth credentials (ID and
        secret) which unequivocally identify the application
    -   Define roles and permissions to manage authorization of users and
        organizations
    -   Can register Pep Proxy to protect backends.
    -   Can register IoT Agents.

Keyrock provides both a GUI and an API interface.

### Software requirements

This GE is based on a JavaScript environment and SQL databases. In order to run
the identity manager the following requirements must be installed:

-   node.js
-   npm
-   mysql-server (^5.7)
-   build-essential

## Install

1.  Clone Proxy repository:

```console
git clone https://github.com/ging/fiware-idm.git
```

2.  Install the dependencies:

```console
cd fiware-idm/
npm install
```

3.  Duplicate config.template in config.js:

```console
cp config.js.template config.js
```

4.  Configure data base access credentials:

```javascript
config.database = {
    host: "localhost", // default: 'localhost'
    password: "idm", // default: 'idm'
    username: "root", // default: 'root'
    database: "idm", // default: 'idm'
    dialect: "mysql" // default: 'mysql'
};
```

5.  To configure the server to listen HTTPS requests, generate certificates
    OpenSSL and configure config.js:

```console
./generate_openssl_keys.sh
```

```javascript
config.https = {
    enabled: true, //default: 'false'
    cert_file: "certs/idm-2018-cert.pem",
    key_file: "certs/idm-2018-key.pem",
    port: 443
};
```

6.  Create database, run migrations and seeders:

```console
npm run-script create_db
npm run-script migrate_db
npm run-script seed_db
```

7.  Start server with admin rights (server listens in 3000 port by default or in
    443 if HTTPS is enabled).

```console
sudo npm start
```

You can test the Identity manager using the default user:

-   Email: `admin@test.com`
-   Password: `1234`

### Docker

We also provide a Docker image to facilitate you the building of this GE.

-   [Here](https://github.com/ging/fiware-idm/tree/master/extras/docker) you
    will find the Dockerfile and the documentation explaining how to use it.
-   In [Docker Hub](https://hub.docker.com/r/fiware/idm/) you will find the
    public image.

## Usage

Information about how to use the Keyrock GUI can be found in the
[User & Programmers Manual](https://fiware-idm.readthedocs.io/en/latest/user_guide/).

## API

Resources can be managed through the API (e.g. Users, applications and
organizations). Further information can be found in the
[API section](http://fiware-idm.readthedocs.org/en/latest/api).

Finally, one of the main uses of this Generic Enabler is to allow developers to
add identity management (authentication and authorization) to their applications
based on FIWARE identity. This is posible thanks to
[OAuth2](https://oauth.net/2/) protocol. For more information check the
[OAuth2 API](http://fiware-idm.readthedocs.org/en/latest/api/#def-apiOAuth).

## Changes Introduced in 7.x

They biggest change introduced in 7.x is that the identity manager no longer
depends on Openstack components Keystone and Horizon. Now is fully implemented
in Node JS. Another remarkable changes have been made:

1.  A driver has been implemented in order to make authentication against
    another database different from the default one.+
2.  The appearance of the web portal can be easily modified though configurable
    themes.
3.  Now users don't need to switch session in order to create an application
    that will belong to an organization.
4.  Permissions of an application can be edited or deleted.
