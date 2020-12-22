# Identity Manager - Keyrock

[![FIWARE Security](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/security.svg)](https://www.fiware.org/developers/catalogue/)
[![License: MIT](https://img.shields.io/github/license/ging/fiware-idm.svg)](https://opensource.org/licenses/MIT)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/idm.svg)](https://hub.docker.com/r/fiware/idm/)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware-keyrock)
<br>
[![Documentation](https://img.shields.io/readthedocs/fiware-idm.svg)](https://fiware-idm.readthedocs.io/en/latest/)
[![CI](https://github.com/ging/fiware-idm/workflows/CI/badge.svg)](https://github.com/ging/fiware-idm/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/ging/fiware-idm/badge.svg?branch=master)](https://coveralls.io/github/ging/fiware-idm?branch=master)
![Status](https://nexus.lab.fiware.org/repository/raw/public/static/badges/statuses/keyrock.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c1f1239e878341b782be7ed9a67afdfd)](https://app.codacy.com/app/apozohue10/fiware-idm?utm_source=github.com&utm_medium=referral&utm_content=ging/fiware-idm&utm_campaign=Badge_Grade_Dashboard)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4414/badge)](https://bestpractices.coreinfrastructure.org/projects/4414)

Keyrock is the FIWARE component responsible for Identity Management. Using
Keyrock (in conjunction with other security components such as
[PEP Proxy](https://github.com/ging/fiware-pep-proxy) and
[Authzforce](https://github.com/authzforce/server)) enables you to add
OAuth2-based authentication and authorization security to your services and
applications.

This project is part of [FIWARE](https://www.fiware.org/). For more information
check the FIWARE Catalogue entry for
[Security](https://github.com/Fiware/catalogue/tree/master/security).

| :books: [Documentation](https://fiware-idm.readthedocs.io/en/latest/) | :mortar_board: [Academy](https://fiware-academy.readthedocs.io/en/latest/security/keyrock) | :whale: [Docker Hub](https://hub.docker.com/r/fiware/idm/) | :dart: [Roadmap](https://github.com/ging/fiware-idm/blob/master/roadmap.md) |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------- |


## Content

-   [Background](#background)
    -   [Software requirements](#software-requirements)
-   [Install](#install)
    -   [Docker](#docker)
-   [Usage](#usage)
-   [API](#api)
-   [Tests](#tests)
-   [Advanced Documentation](#advanced-documentation)
-   [Changes Introduced in 7.x](#changes-introduced-in-7x)
-   [Quality Assurance](#quality-assurance)
-   [License](#license)

---

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
    host: 'localhost', // default: 'localhost'
    password: 'idm', // default: 'idm'
    username: 'root', // default: 'root'
    database: 'idm', // default: 'idm'
    dialect: 'mysql' // default: 'mysql'
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
    cert_file: 'certs/idm-2018-cert.pem',
    key_file: 'certs/idm-2018-key.pem',
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
[User & Programmers Manual](https://fiware-idm.readthedocs.io/en/latest/user_and_programmers_guide/introduction).

## API

Resources can be managed through the API (e.g. Users, applications and
organizations). Further information can be found in the
[API section](https://fiware-idm.readthedocs.io/en/latest/api/introduction).

Finally, one of the main uses of this Generic Enabler is to allow developers to
add identity management (authentication and authorization) to their applications
based on FIWARE identity. This is posible thanks to
[OAuth2](https://oauth.net/2/) protocol. For more information check the
[OAuth2 API](https://fiware-idm.readthedocs.io/en/latest/oauth/introduction).

## Tests

For performing a basic end-to-end test, you have to follow the next steps. A
detailed description about how to run tests can be found
[here](https://fiware-idm.readthedocs.io/en/latest/installation_and_administration_guide/sanity_check/).

1.  Verify that the host address of IdM can be reached. By default, web access
    will show a Login Page.
2.  Acquire a valid username and password and access with those credentials. The
    resulting web page is the landing page of the IdM KeyRock Portal.
3.  Verify that you can view the list of applications, organizations, etc.

## Advanced Documentation

-   [How to run tests](https://fiware-idm.readthedocs.io/en/latest/installation_and_administration_guide/sanity_check/)
-   [User & Programmers Manual](https://fiware-idm.readthedocs.io/en/latest/user_and_programmers_guide/introduction/)
-   [Installation & Administration Guide](https://fiware-idm.readthedocs.io/en/latest/installation_and_administration_guide/introduction/)
-   [Connecting IdM to a eIDAS node](https://fiware-idm.readthedocs.io/en/latest/oauth/introduction)

## Changes Introduced in 7.x

They biggest change introduced in 7.x is that the identity manager no longer
depends on Openstack components Keystone and Horizon. Now is fully implemented
in Node JS. Another remarkable changes have been made:

1.  A driver has been implemented in order to make authentication against
    another database different from the default one.
2.  The appearance of the web portal can be easily modified though configurable
    themes.
3.  Now users don't need to switch session in order to create an application
    that will belong to an organization.
4.  Permissions of an application can be edited or deleted.
5.  IdM could play the role of gateway between services and eDIAS Node in order
    to allow users authentication with their national eID.
6.  OAuth Refresh Token Supported.
7.  Configurable OAuth token types (Permanent tokens and Json Web Tokens).
8.  OAuth Revoke Token endpoint enable.
9.  Internazionalization od UI (Spanish and English supported).
10. User Admin Panel.
11. Trusted application for OAuth token validation.
12. IdM could play the role as PDP for basic authorization.
13. Complete Sign out. Delete session in services as well as in Keyrock.

## Quality Assurance

This project is part of [FIWARE](https://www.fiware.org/) and has been rated as
follows:

-   **Version Tested:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Version&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.version&colorB=blue)
-   **Documentation:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Completeness&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.docCompleteness&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Usability&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.docSoundness&colorB=blue)
-   **Responsiveness:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Time%20to%20Respond&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.timeToCharge&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Time%20to%20Fix&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.timeToFix&colorB=blue)
-   **FIWARE Testing:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Tests%20Passed&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.failureRate&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Scalability&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.scalability&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Performance&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.performance&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Stability&url=https://fiware.github.io/catalogue/json/keyrock.json&query=$.stability&colorB=blue)

---

## License

Keyrock is licensed under the [MIT](LICENSE) License.

© 2018 Universidad Politécnica de Madrid.
