# Quick Start Guide

## Software requirements

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

### Docker Installation

We also provide a Docker image to facilitate you the building of this GE.

-   [Here](https://github.com/ging/fiware-idm/tree/master/extras/docker) you
    will find the Dockerfile and the documentation explaining how to use it.
-   In [Docker Hub](https://hub.docker.com/r/fiware/idm/) you will find the
    public image.
