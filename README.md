

# Identity Manager - Keyrock

[![License badge](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Documentation badge](https://img.shields.io/badge/docs-stable-brightgreen.svg?style=flat)](http://fiware-idm.readthedocs.org/en/stable/)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/idm.svg)](https://hub.docker.com/r/fiware/idm/)
[![Support badge]( https://img.shields.io/badge/support-sof-yellowgreen.svg)](http://stackoverflow.com/questions/tagged/fiware)

+ [Introduction](#def-introduction)
	- [Software requirements](#def-requirements)
+ [How to Build & Install](#def-build)
    - [Docker](#def-docker)
+ [API Overview](#def-api)
+ [Changes Introduced in 7.x](#def-changes)
+ [Advanced documentation](#def-advanced)
+ [License](#def-license)

---


<br>

<a name="def-introduction"></a>
## Introduction

This project is part of [FIWARE](http://fiware.org). You will find more information about this FIWARE GE [here](https://catalogue.fiware.org/enablers/identity-management-keyrock).

- You will find the source code of this project in GitHub [here](https://github.com/ging/fiware-idm)
- You will find the documentation of this project in Read the Docs [here](http://fiware-idm.readthedocs.org/)

Welcome to the main repository for the UPM's implementation of the FIWARE Identity Management Generic Enabler. Thanks to this component and together with PEP Proxy and Authorization PDP GEs, you will add authentication and authorization security to your services and applications.

<a name="def-requirements"></a>
### Software requirements
This GE is based on a javascript environment and SQL databases. In order to run the identity manager the following requirements must be installed:

 - node.js
 - npm
 - mysql-server (^5.7)


<a name="def-build"></a>
## How to Build & Install

 1. Clone Proxy repository:

<pre>
<code>git clone https://github.com/ging/fiware-idm.git</code>
</pre>

 2. Install the dependencies:

<pre>
<code>cd fiware-idm/
npm install</code>
</pre>

 3. Duplicate config.template in config.js:

<pre>
<code>cp config.js.template config.js</code>
</pre>

 4. Configure data base access credentials:

<pre>
		config.database = {
		    host: 'localhost',           // default: 'localhost' 
		    password: 'idm',             // default: 'idm'
		    username: 'root',            // default: 'root'
		    database: 'idm',             // default: 'idm'
		    dialect: 'mysql'             // default: 'mysql'
		}
</pre>

 5. To configure the server to listen HTTPs requests, generate certificates OpenSSL and configure config.js:

<pre>
<code>./generate_openssl_keys.sh</code>
</pre>

<pre>
		config.https = {
		    enabled: true, 		//default: 'false'
		    cert_file: 'certs/idm-2018-cert.pem',
		    key_file: 'certs/idm-2018-key.pem',
		    port: 443
		}
</pre>

 6. Create database, run migrations and seeders:

<pre>
<code>npm run-script create_db
npm run-script migrate_db 
npm run-script seed_db </code>
</pre>

 7. Start server with admin rights (server listens in 3000 port by
    default or in 443 if HTTPs is enabled).

<pre>
<code>sudo npm start</code>
</pre>


You can test de Identity manager using the default user:
 - Email: admin@test.com
 - Password: 1234

<a name="def-docker"></a>
### Docker

We also provide a Docker image to facilitate you the building of this GE.

- [Here](https://github.com/ging/fiware-idm/tree/master/extras/docker) you will find the Dockerfile and the documentation explaining how to use it.
- In [Docker Hub](https://hub.docker.com/r/fiware/idm/) you will find the public image.

<a name="def-changes"></a>
## Changes Introduced in 7.x
They biggest change introduced in 7.x is that the identity manager no longer depends on Openstack components Keystone and Horizon. Now is fully implemented in Node JS. Another remarkable changes have been made:

 1. A driver has been implemented in order to make authentication against another database different from the default one.+
 2. The appearance of the web portal can be easily modified though configurable themes.
 3. Now users don't need to switch session in order to create an application that will belong to an organization.
 4. Permissions of an application can be edited or deleted.

<a name="def-api"></a>
## API Overview
Several resources could be managed through the API like users, applications or organizations. Further information could be found in the [API section](http://fiware-idm.readthedocs.org/en/latest/api/#def-apiIdm).

Finally, one of the main uses of this Generic Enabler is to allow developers to add identity management (authentication and authorization) to their applications based on FIWARE identity. This is posible thanks to [OAuth2](https://oauth.net/2/) protocol. For more information check the [OAuth2 API](http://fiware-idm.readthedocs.org/en/latest/api/#def-apiOAuth).

<a name="def-advanced"></a>
## Advanced Documentation

- [How to run tests](http://fiware-idm.readthedocs.org/en/latest/admin_guide#end-to-end-testing)
- [User & Programmers Manual](http://fiware-idm.readthedocs.org/en/latest/user_guide/)
- [Installation & Administration Guide](http://fiware-idm.readthedocs.org/en/latest/admin_guide/)

<a name="def-license"></a>
## License

The MIT License

Copyright (C) 2018 Universidad Politécnica de Madrid.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
