# System Installation

This section describes two ways of installing Identity Manager Keyrock:

-   Host installation. This should be used for developing purpouses.

-   Docker installation. This could be use for testing this tool.

## Host Installation

### Requirements

In order to execute Keyrock, it is needed to have previously installed the
following software:

-   [Node.js](http://nodejs.org/download).

-   [Node Packaged Modules](https://npmjs.org). It is usually included within
    Node.js.

-   [MySQL](https://www.mysql.com).

### Installation

The following steps need to be performed to get Keyrock up and running:

&nbsp;&nbsp;1\. Download the software, using
[GitHub](http://github.com/ging/fiware-idm).

```bash
    git clone https://github.com/ging/fiware-idm
```

&nbsp;&nbsp;2\. Install all required libraries using npm.

```bash
cd fiware-idm
npm install
```

&nbsp;&nbsp;3\. Configure the installation. To configure Keyrock you can copy
the file named config.js.template to config.js.

```bash
cp config.js.template config.js
```

&nbsp;&nbsp;Edit it with the corresponding with basic info. Below you can see an
example:

&nbsp;&nbsp;&nbsp;&nbsp;3.1\.Configure port and host:

```javascript
config.host = 'http://localhost:3000';
config.port = 3000;
```

&nbsp;&nbsp;&nbsp;&nbsp;3.2\.Configure database:

```javascript
config.database = {
    host: 'localhost',
    password: 'idm',
    username: 'root',
    database: 'idm',
    dialect: 'mysql'
};
```

&nbsp;&nbsp;&nbsp;&nbsp;3.3\.Configure session key:

```javascript
config.session = {
    secret: 'nodejs_idm'
};
```

&nbsp;&nbsp;&nbsp;&nbsp;3.4\.Configure password encryption:

```javascript
config.password_encryption = {
    key: 'nodejs_idm'
};
```

&nbsp;&nbsp;4\.Create database, run migrations and seeders:

```bash
npm run-script create_db
npm run-script migrate_db
npm run-script seed_db
```

&nbsp;&nbsp;5\.Launch the server:

```bash
npm start
```

&nbsp;&nbsp;&nbsp;&nbsp;5.1\.You can also install forever.js to run it in a
production environment:

```bash
sudo npm install forever -g
```

&nbsp;&nbsp;&nbsp;&nbsp;5.2\.And then run the server using forever:

```bash
forever start bin/www
```

&nbsp;&nbsp;&nbsp;&nbsp;5.3\.To know the status of the process you can run the
next command:

```bash
forever status
```

## Docker Installation

### Requirements

In order to execute Keyrock, it is needed to have previously installed the
following software:

-   [Docker](https://www.docker.com/).

-   [Docker Compose](https://docs.docker.com/compose).

### Installation

We also provide a Docker image to facilitate you the building of this GE.

-   [Here](https://github.com/ging/fiware-idm/tree/master/extras/docker) you
    will find the Dockerfile and the documentation explaining how to use it.

-   In [Docker Hub](https://hub.docker.com/r/fiware/idm/) you will find the
    public image.
