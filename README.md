

# Identity Manager - Keyrock

[![FIWARE Security](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/security.svg)](https://www.fiware.org/developers/catalogue/)
[![License: MIT](https://img.shields.io/github/license/ging/fiware-idm.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/readthedocs/fiware-idm.svg)](https://fiware-idm.readthedocs.io/en/latest/)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/idm.svg)](https://hub.docker.com/r/fiware/idm/)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/search?q=%5Bfiware%5D+keyrock)
![Status](https://nexus.lab.fiware.org/repository/raw/public/static/badges/statuses/keyrock.svg)

* [Introduction](#introduction)
    + [Software requirements](#software-requirements)
* [How to Build & Install](#how-to-build--install)
    + [Docker](#docker)
* [Changes Introduced in 7.x](#changes-introduced-in-7x)
* [API Overview](#api-overview)
* [Advanced Documentation](#advanced-documentation)
* [License](#license)

---



## Introduction

This project is part of [FIWARE](http://fiware.org). You will find more information about this FIWARE GE [here](https://catalogue-server.fiware.org/enablers/identity-management-keyrock).

- You will find the source code of this project in GitHub [here](https://github.com/ging/fiware-idm)
- You will find the documentation of this project in Read the Docs [here](https://fiware-idm.readthedocs.io/en/latest/)

Welcome to the main repository for the UPM's implementation of the FIWARE Identity Management Generic Enabler. Thanks to this component and together with PEP Proxy and Authorization PDP GEs, you will add authentication and authorization security to your services and applications.


### Software requirements
This GE is based on a javascript environment and SQL databases. In order to run the identity manager the following requirements must be installed:

 - node.js
 - npm
 - mysql-server (^5.7)
 - build-essential


## How to Build & Install

 1. Clone Proxy repository:

```console
git clone https://github.com/ging/fiware-idm.git
```

 2. Install the dependencies:

```console
cd fiware-idm/
npm install
```

 3. Duplicate config.template in config.js:

```console
cp config.js.template config.js
```

 4. Configure data base access credentials:

```javascript
config.database = {
    host: 'localhost',           // default: 'localhost'
    password: 'idm',             // default: 'idm'
    username: 'root',            // default: 'root'
    database: 'idm',             // default: 'idm'
    dialect: 'mysql'             // default: 'mysql'
}
```

 5. To configure the server to listen HTTPs requests, generate certificates OpenSSL and configure config.js:

```console
./generate_openssl_keys.sh
```

```javascript
config.https = {
    enabled: true, 		//default: 'false'
    cert_file: 'certs/idm-2018-cert.pem',
    key_file: 'certs/idm-2018-key.pem',
    port: 443
}
```

 6. Create database, run migrations and seeders:

```console
npm run-script create_db
npm run-script migrate_db
npm run-script seed_db
```

 7. Start server with admin rights (server listens in 3000 port by
    default or in 443 if HTTPs is enabled).

```console
sudo npm start
```

You can test the Identity manager using the default user:
 - Email: `admin@test.com`
 - Password: `1234`


### Docker

We also provide a Docker image to facilitate you the building of this GE.

- [Here](./README-Docker.md) you will find the Dockerfile and the documentation explaining how to use it.
- In [Docker Hub](https://hub.docker.com/r/fiware/idm/) you will find the public image.


## Changes Introduced in 7.x
They biggest change introduced in 7.x is that the identity manager no longer depends on Openstack components Keystone and Horizon. Now is fully implemented in Node JS. Another remarkable changes have been made:

 1. A driver has been implemented in order to make authentication against another database different from the default one.+
 2. The appearance of the web portal can be easily modified though configurable themes.
 3. Now users don't need to switch session in order to create an application that will belong to an organization.
 4. Permissions of an application can be edited or deleted.


## API Overview
Several resources could be managed through the API like users, applications or organizations. Further information could be found in the [API section](http://fiware-idm.readthedocs.org/en/latest/api/#def-apiIdm).

Finally, one of the main uses of this Generic Enabler is to allow developers to add identity management (authentication and authorization) to their applications based on FIWARE identity. This is posible thanks to [OAuth2](https://oauth.net/2/) protocol. For more information check the [OAuth2 API](http://fiware-idm.readthedocs.org/en/latest/api/#def-apiOAuth).


## Advanced Documentation

- [How to run tests](http://fiware-idm.readthedocs.org/en/latest/admin_guide#end-to-end-testing)
- [User & Programmers Manual](http://fiware-idm.readthedocs.org/en/latest/user_guide/)
- [Installation & Administration Guide](http://fiware-idm.readthedocs.org/en/latest/admin_guide/)
- [Connecting IdM to a eIDAS node](http://fiware-idm.readthedocs.org/en/latest/eidas/)

---

## License

[MIT](LICENSE) © 2018 Universidad Politécnica de Madrid.

